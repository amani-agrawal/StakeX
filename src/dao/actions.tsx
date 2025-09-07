// src/useDao.tsx
import React, { useCallback, useMemo } from "react"
import { useWallet, WalletProvider } from "@txnlab/use-wallet-react"
import {
  createDaoViaFactory,
  proposeOnDao,
  voteOnDao,
  addMemberAllowlist,
  grantMembershipByToken,
  optInToAsaSelf,
  type DaoCreationInput,
  type WalletDeps,
} from "./helper";               // ← fix path
import { walletManager } from "../wallet/walletManager"

// ---------- Provider that wraps your tree with the WalletManager ----------
export function DaoProvider({ children }: { children: React.ReactNode }) {
  return <WalletProvider manager={walletManager}>{children}</WalletProvider>
}

// (Optional) HOC if you prefer wrapping components ad-hoc
export const withDaoWallet =
  <P extends object>(Component: React.ComponentType<P>) =>
  (props: P) =>
    (
      <DaoProvider>
        <Component {...props} />
      </DaoProvider>
    )

// ---------- Hook that uses the wallet context (must be used under DaoProvider) ----------
export function useDao() {
  const { algodClient, activeAddress, transactionSigner, isReady } = useWallet();

  const deps: WalletDeps | null = useMemo(() => {
    if (!algodClient || !activeAddress || !transactionSigner) return null
    return { algod: algodClient, sender: activeAddress, signer: transactionSigner }
  }, [algodClient, activeAddress, transactionSigner])

  const ensure = () => {
    if (!deps) throw new Error("Wallet not connected")
    return deps
  }

  const createDao = useCallback(
    (args: DaoCreationInput) => createDaoViaFactory(ensure(), args),
    [deps]
  )

  const propose = useCallback(
    (daoAppId: number, meta: string) => proposeOnDao(ensure(), { daoAppId, meta }),
    [deps]
  )

  const vote = useCallback(
    (daoAppId: number, proposalId: number | bigint, support: boolean) =>
      voteOnDao(ensure(), { daoAppId, proposalId, support }),
    [deps]
  )

  const addMember = useCallback(
    (daoAppId: number, who: string, daoAbiJson?: any) =>
      addMemberAllowlist(ensure(), { daoAppId, who, daoAbiJson }),
    [deps]
  )

  const grantMemberToken = useCallback(
    (asaId: number, to: string, amount: number | bigint = 1) =>
      grantMembershipByToken(ensure(), { asaId, to, amount }),
    [deps]
  )

  const optInToMembershipToken = useCallback(
    (asaId: number) => optInToAsaSelf(ensure(), asaId),
    [deps]
  )

  return {
    isReady: Boolean(deps) && isReady,
    address: activeAddress,
    createDao,
    propose,
    vote,
    addMember,                 // allowlist path
    grantMemberToken,          // token-gated: admin grants ASA
    optInToMembershipToken,    // token-gated: user opts into ASA
  }
}