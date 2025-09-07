// src/wallet/lute.js
import LuteConnect from "lute-connect";
import algosdk from "algosdk";
import { Buffer } from 'buffer';

export const lute = new LuteConnect();

// Configure algod (TestNet example - replace with your endpoint)
export const algodClient = new algosdk.Algodv2(
  { "X-Algo-API-Token": "" },                       // header (leave empty if not required)
  "https://testnet-api.4160.nodely.dev",             // base URL for TestNet (example)
  443                                                // port, often empty for https
);

// Connect must be called from a user gesture (button click)
export async function connectLute() {
  const genesis = JSON.parse(await algodClient.genesis().do());
  console.log('genesis', genesis); // Lute expects this
  console.log('geneis properties', genesis.properties);

  const genesisID = `${genesis.network}-${genesis.id}`; 
  const addresses = await lute.connect(genesisID);
  return addresses; // array of account addresses; you pick one
}

// Build & sign a payment (send ALGO in microAlgos)
export async function payAlgo({ from, to, microAlgos }) {
  const params = await algodClient.getTransactionParams().do();

  console.log(from, to, microAlgos);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: algosdk.Address.fromString(from),
    receiver: algosdk.Address.fromString(to),
    amount: microAlgos,        // 1 ALGO = 1_000_000 microAlgos
    suggestedParams: params,
  });

  console.log('txn', txn);

  // Lute expects an array of unsigned txns (base64)
  const unsigned =  Buffer.from(txn.toByte()).toString("base64")

  console.log('unsigned', unsigned);
  const signed = await lute.signTxns([{ txn: unsigned} ]);         // opens Lute popup

  console.log('signed', signed);

  // Submit signed blob back to the network
  const { txId } = await algodClient.sendRawTransaction(
    signed[0]
  ).do();

  console.log('txId', txId);

  // Wait for confirmation (simple poll)
  await algosdk.waitForConfirmation(algodClient, txId, 4);
  return txId;
}
