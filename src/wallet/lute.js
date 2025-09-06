// src/wallet/lute.js
import LuteConnect from "lute-connect";
import algosdk from "algosdk";

export const lute = new LuteConnect();

// Configure algod (TestNet example - replace with your endpoint)
export const algodClient = new algosdk.Algodv2(
  { "X-Algo-API-Token": "" },                       // header (leave empty if not required)
  "https://testnet-api.algonode.cloud",             // base URL for TestNet (example)
  ""                                                // port, often empty for https
);

// Connect must be called from a user gesture (button click)
export async function connectLute() {
  const genesis = await algodClient.genesis().do();
  const genesisID = `${genesis.network}-${genesis.id}`;  // Lute expects this
  const addresses = await lute.connect(genesisID);
  return addresses; // array of account addresses; you pick one
}

// Build & sign a payment (send ALGO in microAlgos)
export async function payAlgo({ from, to, microAlgos }) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from,
    to,
    amount: microAlgos,        // 1 ALGO = 1_000_000 microAlgos
    suggestedParams: params,
  });

  // Lute expects an array of unsigned txns (base64)
  const unsigned = Buffer.from(txn.toByte()).toString("base64");
  const signed = await lute.signTxns([unsigned]);         // opens Lute popup

  // Submit signed blob back to the network
  const { txId } = await algodClient.sendRawTransaction(
    Uint8Array.from(Buffer.from(signed[0], "base64"))
  ).do();

  // Wait for confirmation (simple poll)
  await algosdk.waitForConfirmation(algodClient, txId, 4);
  return txId;
}
