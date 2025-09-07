// src/daoHelpers.ts
import algosdk from "algosdk"

type ATCExecuteResult = Awaited<
  ReturnType<algosdk.AtomicTransactionComposer["execute"]>
>

// --------------------------- Types ---------------------------

export type WalletDeps = {
  algod: algosdk.Algodv2
  sender: string
  signer: algosdk.TransactionSigner
}

export type DaoSchema = {
  globalInts: number
  globalBytes: number
  localInts: number
  localBytes: number
  extraPages?: number
}

export type AsaParams = {
  enabled?: boolean
  total?: bigint | number
  decimals?: number
  unitName?: string
  assetName?: string
  defaultFrozen?: boolean
  manager?: string
  reserve?: string
  freeze?: string
  clawback?: string
}

export type DaoCreationInput = {
  factoryAppId: number
  meta: string
  daoApprovalB64: string
  daoClearB64: string
  schema: DaoSchema
  asa?: AsaParams
  daoAbiJson?: any
  factoryAbiJson?: any
}

export type DaoCreationResult = {
  daoId: bigint
  asaId: bigint
  txIDs: string[]
  raw: ATCExecuteResult
}

export type ProposeInput = {
  daoAppId: number
  meta: string
  daoAbiJson?: any
}

export type VoteInput = {
  daoAppId: number
  proposalId: number | bigint
  support: boolean
  daoAbiJson?: any
}

export type AddMemberAllowlistInput = {
  daoAppId: number
  who: string                 // Algorand address to add
  daoAbiJson?: any            // ABI that includes add_member(address)
}

export type GrantMembershipByTokenInput = {
  asaId: number
  to: string                  // address receiving membership token
  amount?: number | bigint    // default 1
}

// --- NEW: allowlist-based membership (calls add_member) ---
export async function addMemberAllowlist(
  deps: WalletDeps,
  { daoAppId, who, daoAbiJson = {
    name: "VotingDAO",
    methods: [
      { name: "add_member", args: [{ type: "address", name: "who" }], returns: { type: "void" } },
    ],
  } }: AddMemberAllowlistInput
): Promise<string> {
  const { algod, sender, signer } = deps
  const sp = await getSp(algod)

  const dao = new algosdk.ABIContract(daoAbiJson as any)
  const m = algosdk.getMethodByName(dao.methods, "add_member")

  const atc = new algosdk.AtomicTransactionComposer()
  atc.addMethodCall({
    appID: daoAppId,
    method: m,
    methodArgs: [who],        // ABI 'address' is a plain string address
    sender,
    signer,
    suggestedParams: sp,
  })
  const res = await atc.execute(algod, 3)
  return res.txIDs[0]
}

// --- NEW: token-gated membership (admin grants 1 ASA to 'to') ---
export async function grantMembershipByToken(
  deps: WalletDeps,
  { asaId, to, amount = 1 }: GrantMembershipByTokenInput
): Promise<string> {
  const { algod, sender, signer } = deps
  const sp = await getSp(algod)

  const tx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: sender,             // admin (must hold ASA)
    receiver: to,
    assetIndex: asaId,
    amount: amount as any,    // number | bigint
    suggestedParams: sp,
  })

  const atc = new algosdk.AtomicTransactionComposer()
  atc.addTransaction({ txn: tx, signer })
  const res = await atc.execute(algod, 3)
  return res.txIDs[0]
}

// --- NEW: helper for the connected user to opt-in to the ASA ---
export async function optInToAsaSelf(
  deps: WalletDeps,
  asaId: number
): Promise<string> {
  const { algod, sender, signer } = deps
  const sp = await getSp(algod)

  const tx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: sender,
    receiver: sender,
    assetIndex: asaId,
    amount: 0,                // opt-in
    suggestedParams: sp,
  })

  const atc = new algosdk.AtomicTransactionComposer()
  atc.addTransaction({ txn: tx, signer })
  const res = await atc.execute(algod, 3)
  return res.txIDs[0]
}
// ---------------------- Default ABIs ------------------------

const DEFAULT_FACTORY_ABI = {
  name: "DaoFactory",
  methods: [
    {
      name: "create_dao",
      args: [{ type: "string", name: "meta" }],
      returns: { type: "(uint64,uint64)" },
    },
  ],
}

const DEFAULT_DAO_ABI = {
  name: "VotingDAO",
  methods: [
    { name: "propose", args: [{ type: "string", name: "meta" }], returns: { type: "void" } },
    {
      name: "vote",
      args: [
        { type: "uint64", name: "proposal_id" },
        { type: "bool", name: "support" },
      ],
      returns: { type: "void" },
    },
  ],
}

// ----------------------- Utilities --------------------------

const u8aFromB64 = (b64: string): Uint8Array => {
  if (typeof atob === "function") {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  }
  // Node fallback
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require("buffer")
  return new Uint8Array(Buffer.from(b64, "base64"))
}

const getSp = async (algod: algosdk.Algodv2) => await algod.getTransactionParams().do()

// ------------------------ Core API --------------------------

/**
 * Create a new DAO via your Factory App.
 * Group order:
 *   gtxn[0] Factory NoOp: create_dao(meta)
 *   gtxn[1] ApplicationCreate: DAO app (approval/clear/schema)
 *   gtxn[2] (optional) AssetCreate: governance token ASA
 */
export async function createDaoViaFactory(
  deps: WalletDeps,
  input: DaoCreationInput
): Promise<DaoCreationResult> {
  const { algod, sender, signer } = deps
  const {
    factoryAppId,
    meta,
    daoApprovalB64,
    daoClearB64,
    schema,
    asa,
    daoAbiJson = DEFAULT_DAO_ABI, // not used here, kept for symmetry
    factoryAbiJson = DEFAULT_FACTORY_ABI,
  } = input

  const sp = await getSp(algod)

  // gtxn[0] — Factory ABI call: create_dao(meta)
  const factory = new algosdk.ABIContract(factoryAbiJson as any)
  const mCreateDao = algosdk.getMethodByName(factory.methods, "create_dao")
  const atc = new algosdk.AtomicTransactionComposer()
  atc.addMethodCall({
    appID: factoryAppId,
    method: mCreateDao,
    methodArgs: [meta],
    sender,
    signer,
    suggestedParams: sp,
  })

  // gtxn[1] — DAO ApplicationCreate
  const approval = u8aFromB64(daoApprovalB64)
  const clear = u8aFromB64(daoClearB64)

  const daoCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
    sender: sender,
    approvalProgram: approval,
    clearProgram: clear,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: sp,
    numGlobalInts: schema.globalInts,
    numGlobalByteSlices: schema.globalBytes,
    numLocalInts: schema.localInts,
    numLocalByteSlices: schema.localBytes,
    extraPages: schema.extraPages ?? 0,
  })
  atc.addTransaction({ txn: daoCreateTxn, signer })

  // gtxn[2] — Optional ASA create (governance token)
  if (asa?.enabled) {
    const manager = asa.manager ?? sender
    const reserve = asa.reserve ?? sender
    const freeze = asa.freeze ?? sender
    const clawback = asa.clawback ?? sender

    const asaTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: sender,
      total: asa.total ?? BigInt(1_000_000),
      decimals: asa.decimals ?? 0,
      unitName: asa.unitName ?? "VOTE",
      assetName: asa.assetName ?? "Voting Token",
      defaultFrozen: asa.defaultFrozen ?? false,
      manager,
      reserve,
      freeze,
      clawback,
      suggestedParams: sp,
    })
    atc.addTransaction({ txn: asaTxn, signer })
  }

  const exec = await atc.execute(algod, 4)
  const [daoId, asaId] = exec.methodResults[0].returnValue as [bigint, bigint]

  return { daoId, asaId, txIDs: exec.txIDs, raw: exec }
}

/** Calls `propose(string)` on the DAO app. */
export async function proposeOnDao(
  deps: WalletDeps,
  { daoAppId, meta, daoAbiJson = DEFAULT_DAO_ABI }: ProposeInput
): Promise<string> {
  const { algod, sender, signer } = deps
  const sp = await getSp(algod)

  const dao = new algosdk.ABIContract(daoAbiJson as any)
  const mPropose = algosdk.getMethodByName(dao.methods, "propose")

  const atc = new algosdk.AtomicTransactionComposer()
  atc.addMethodCall({
    appID: daoAppId,
    method: mPropose,
    methodArgs: [meta],
    sender,
    signer,
    suggestedParams: sp,
  })
  const res = await atc.execute(algod, 3)
  return res.txIDs[0]
}

/** Calls `vote(uint64,bool)` on the DAO app. */
export async function voteOnDao(
  deps: WalletDeps,
  { daoAppId, proposalId, support, daoAbiJson = DEFAULT_DAO_ABI }: VoteInput
): Promise<string> {
  const { algod, sender, signer } = deps
  const sp = await getSp(algod)

  const dao = new algosdk.ABIContract(daoAbiJson as any)
  const mVote = algosdk.getMethodByName(dao.methods, "vote")

  const atc = new algosdk.AtomicTransactionComposer()
  atc.addMethodCall({
    appID: daoAppId,
    method: mVote,
    methodArgs: [BigInt(proposalId as any), Boolean(support)],
    sender,
    signer,
    suggestedParams: sp,
  })
  const res = await atc.execute(algod, 3)
  return res.txIDs[0]
}