import { WalletManager, WalletId, NetworkId } from "@txnlab/use-wallet-react"

export const walletManager = new WalletManager({
  wallets: [WalletId.LUTE], // add others only if you've installed their providers
  defaultNetwork: NetworkId.TESTNET,
  networks: {
    testnet: {
      algod: { baseServer: "https://testnet-api.algonode.cloud", token: "", port: "" },
      isTestnet: true,
    },
  },
})

export default walletManager