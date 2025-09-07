// DAOChatPage.tsx
// A single React page that shows DAO conversations per proposal in a chat layout
// and enforces single-vote-per-user (client-side) on each proposal.
//
// Assumptions:
// - Your backend stores a record like: { daoId: number, daoProposals: Proposal[] }
// - Each Proposal contains a voters map so we can determine if the active user has voted.
// - On-chain enforcement should also exist in your DAO smart contract (this UI only prevents duplicate votes client-side).
// - Uses your existing useDao() hook (from previous messages) for on-chain propose/vote.
//
// To integrate:
// 1) Ensure you have `useDao` exported with { address, propose, vote }.
// 2) Replace `loadDao` / `saveDao` with real fetchers to your DB.
// 3) Pass the intended daoId via props or route; here we accept an optional prop.

import React, { useEffect, useMemo, useState } from "react"
//import { useDao } from "../dao/actions"

// ---------------- Types ----------------

type DaoMessage = {
  id: string
  sender: string
  text: string
  ts: number // epoch ms
}

type DaoProposal = {
  id: number
  title: string
  meta?: string
  creator: string
  createdAt: number
  messages: DaoMessage[]
  voters: Record<string, "yes" | "no"> // address -> vote
  yes: number
  no: number
  closed?: boolean
}

type DaoRecord = {
  daoId: number
  daoProposals: DaoProposal[]
}

// ------------- Mock persistence (replace with your API) -------------
async function loadDao(daoId: number): Promise<DaoRecord> {
  // TODO: replace with GET /dao/:daoId
  // Demo seed if nothing found
  const seed: DaoRecord = {
    daoId,
    daoProposals: [
      {
        id: 1,
        title: "Increase quorum to 10%",
        meta: '{"type":"PARAM","field":"quorum","value":0.10}',
        creator: "CREATOR_ADDR",
        createdAt: Date.now() - 1000 * 60 * 60,
        messages: [
          { id: "m1", sender: "CREATOR_ADDR", text: "Proposing to raise quorum.", ts: Date.now() - 1000 * 60 * 60 },
          { id: "m2", sender: "MEMBER_A", text: "I think this helps prevent spam.", ts: Date.now() - 1000 * 60 * 40 },
        ],
        voters: {},
        yes: 0,
        no: 0,
      },
      {
        id: 2,
        title: "Add member 2US3...XYZ",
        meta: '{"type":"ADD_MEMBER","addr":"2US3...XYZ"}',
        creator: "CREATOR_ADDR",
        createdAt: Date.now() - 1000 * 60 * 20,
        messages: [
          { id: "m3", sender: "CREATOR_ADDR", text: "Proposing to add a new member.", ts: Date.now() - 1000 * 60 * 20 },
        ],
        voters: {},
        yes: 0,
        no: 0,
      },
    ],
  }
  // Try localStorage cache for demo
  const key = `dao:${daoId}`
  const cached = localStorage.getItem(key)
  if (cached) return JSON.parse(cached)
  localStorage.setItem(key, JSON.stringify(seed))
  return seed
}

async function saveDao(record: DaoRecord): Promise<void> {
  // TODO: replace with POST/PUT to your API
  const key = `dao:${record.daoId}`
  localStorage.setItem(key, JSON.stringify(record))
}

// ------------- Helpers -------------

function fmt(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}

function you(address?: string) {
  return address?.slice(0, 6) + "…" + address?.slice(-6)
}

function hasUserVoted(p: DaoProposal, addr?: string | null) {
  if (!addr) return false
  if (p.voters[addr]) return true
  const k = `vote:${p.id}:${addr}`
  return localStorage.getItem(k) != null
}

// ------------- UI Component -------------

export default function DAOChatPage({ daoId: daoIdProp }: { daoId?: number }) {
  const daoId = daoIdProp ?? 999999 // default for demo
  // Replace useDao() with hardcoded values (for UI/dev only)
  const address = "TESTADDR-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

  const propose = async (daoAppId: number, meta: string) => {
    console.log("stub propose", { daoAppId, meta });
    return "TXID_PROPOSE_STUB";
  };

  const vote = async (
    daoAppId: number,
    proposalId: number | bigint,
    support: boolean
  ) => {
    console.log("stub vote", { daoAppId, proposalId, support });
    return "TXID_VOTE_STUB";
  };


  const [dao, setDao] = useState<DaoRecord | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [newProposalTitle, setNewProposalTitle] = useState("")
  const [newProposalMeta, setNewProposalMeta] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ;(async () => {
      const r = await loadDao(daoId)
      setDao(r)
      if (r.daoProposals.length) setSelected(r.daoProposals[0].id)
    })()
  }, [daoId])

  const current = useMemo(
    () => dao?.daoProposals.find((p) => p.id === selected) || null,
    [dao, selected]
  )

  async function addMessage() {
    if (!dao || !current) return
    const txt = message.trim()
    if (!txt) return
    const m: DaoMessage = { id: crypto.randomUUID(), sender: address || "ANON", text: txt, ts: Date.now() }
    const next: DaoRecord = {
      ...dao,
      daoProposals: dao.daoProposals.map((p) =>
        p.id === current.id ? { ...p, messages: [...p.messages, m] } : p
      ),
    }
    setDao(next)
    setMessage("")
    await saveDao(next)
  }

  async function handleVote(support: boolean) {
    if (!dao || !current) return
    if (hasUserVoted(current, address)) return
    setBusy(true)
    try {
      // On-chain vote (will throw if contract rejects)
      await vote(dao.daoId, current.id, support)

      const addr = address || "ANON"
      const next: DaoProposal = {
        ...current,
        voters: { ...current.voters, [addr]: support ? "yes" : "no" },
        yes: support ? current.yes + 1 : current.yes,
        no: !support ? current.no + 1 : current.no,
      }
      const updated: DaoRecord = {
        ...dao,
        daoProposals: dao.daoProposals.map((p) => (p.id === current.id ? next : p)),
      }
      setDao(updated)
      await saveDao(updated)
      // client-side lock to prevent re-vote
      localStorage.setItem(`vote:${current.id}:${addr}`, support ? "yes" : "no")
    } finally {
      setBusy(false)
    }
  }

  async function handlePropose() {
    if (!dao) return
    const t = newProposalTitle.trim()
    if (!t) return
    setBusy(true)
    try {
      // On-chain propose
      await propose(dao.daoId, newProposalMeta || t)
      const np: DaoProposal = {
        id: dao.daoProposals.length ? Math.max(...dao.daoProposals.map((p) => p.id)) + 1 : 1,
        title: t,
        meta: newProposalMeta || undefined,
        creator: address || "ANON",
        createdAt: Date.now(),
        messages: [
          { id: crypto.randomUUID(), sender: address || "ANON", text: `Created: ${t}`, ts: Date.now() },
        ],
        voters: {},
        yes: 0,
        no: 0,
      }
      const updated: DaoRecord = { ...dao, daoProposals: [np, ...dao.daoProposals] }
      setDao(updated)
      setSelected(np.id)
      setNewProposalTitle("")
      setNewProposalMeta("")
      await saveDao(updated)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
      <aside className="md:col-span-4 border rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Proposals</h2>
          <span className="text-xs opacity-60">DAO #{daoId}</span>
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
          {dao?.daoProposals.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`w-full text-left p-3 rounded-xl border hover:shadow transition ${
                selected === p.id ? "border-black" : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium truncate">#{p.id} · {p.title}</div>
                <div className="text-xs opacity-60">{fmt(p.createdAt)}</div>
              </div>
              <div className="mt-1 flex gap-3 text-xs">
                <span>👍 {p.yes}</span>
                <span>👎 {p.no}</span>
                {p.closed && <span className="px-2 py-0.5 rounded bg-gray-200">Closed</span>}
              </div>
            </button>
          ))}
          {!dao?.daoProposals?.length && (
            <div className="text-sm opacity-60">No proposals yet.</div>
          )}
        </div>

        {/* New Proposal */}
        <div className="mt-4 border-t pt-3">
          <h3 className="font-medium mb-2">New proposal</h3>
          <input
            className="w-full border rounded-xl p-2 mb-2"
            placeholder="Title"
            value={newProposalTitle}
            onChange={(e) => setNewProposalTitle(e.target.value)}
          />
          <textarea
            className="w-full border rounded-xl p-2 mb-2"
            placeholder='Meta (e.g. {"type":"PARAM","field":"quorum","value":0.1})'
            value={newProposalMeta}
            onChange={(e) => setNewProposalMeta(e.target.value)}
            rows={3}
          />
          <button
            onClick={handlePropose}
            disabled={busy || !address}
            className="px-3 py-2 rounded-xl border w-full"
            title={!address ? "Connect wallet to propose" : "Create proposal"}
          >
            {busy ? "Submitting…" : "Create Proposal"}
          </button>
          {!address && <div className="mt-2 text-xs opacity-60">Connect wallet to propose.</div>}
        </div>
      </aside>

      {/* Chat / Conversation */}
      <main className="md:col-span-8 border rounded-2xl p-3 flex flex-col h-[80vh]">
        {!current ? (
          <div className="m-auto opacity-60">Select a proposal to view conversation</div>
        ) : (
          <>
            <header className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">#{current.id} · {current.title}</h2>
                  <div className="text-xs opacity-60">Created {fmt(current.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">👍 {current.yes} · 👎 {current.no}</span>
                  <VoteButtons proposal={current} address={address} onVote={handleVote} busy={busy} />
                </div>
              </div>
            </header>

            <section className="flex-1 overflow-auto space-y-2 pr-1">
              {current.messages.map((m) => (
                <ChatBubble key={m.id} mine={m.sender === address} sender={m.sender} ts={m.ts}>
                  {m.text}
                </ChatBubble>
              ))}
            </section>

            <footer className="mt-3 flex gap-2">
              <input
                className="flex-1 border rounded-xl p-2"
                placeholder="Write a message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="px-3 py-2 rounded-xl border" onClick={addMessage} disabled={!address}>
                Send
              </button>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}

// ------------- Subcomponents -------------

function ChatBubble({ children, mine, sender, ts }: { children: React.ReactNode; mine?: boolean; sender: string; ts: number }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] p-3 rounded-2xl border shadow-sm ${mine ? "bg-black text-white" : "bg-white"}`}>
        <div className="text-xs opacity-70 mb-1">{you(sender)} • {fmt(ts)}</div>
        <div className="whitespace-pre-wrap break-words">{children}</div>
      </div>
    </div>
  )
}

function VoteButtons({ proposal, address, onVote, busy }: {
  proposal: DaoProposal
  address?: string | null
  onVote: (support: boolean) => void
  busy?: boolean
}) {
  const voted = hasUserVoted(proposal, address)
  return (
    <div className="flex gap-2">
      <button
        className="px-3 py-1.5 rounded-xl border disabled:opacity-50"
        onClick={() => onVote(true)}
        disabled={busy || voted || proposal.closed || !address}
        title={!address ? "Connect wallet to vote" : voted ? "You already voted" : "Vote yes"}
      >
        👍 Yes
      </button>
      <button
        className="px-3 py-1.5 rounded-xl border disabled:opacity-50"
        onClick={() => onVote(false)}
        disabled={busy || voted || proposal.closed || !address}
        title={!address ? "Connect wallet to vote" : voted ? "You already voted" : "Vote no"}
      >
        👎 No
      </button>
    </div>
  )
}