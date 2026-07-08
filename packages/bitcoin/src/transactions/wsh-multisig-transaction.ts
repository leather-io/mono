import { base64, hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

import { compileWshDescriptor } from '../descriptors/wsh-descriptor';
import { BtcSignerNetwork } from '../utils/bitcoin.network';

export interface WshMultisigPsbtInput {
  txid: string;
  vout: number;
  value: number;
}

export interface WshMultisigPsbtOutput {
  value: bigint;
  address?: string;
}

export interface AssembleWshMultisigPsbtArgs {
  scriptPubKey: Uint8Array;
  witnessScript: Uint8Array;
  inputs: WshMultisigPsbtInput[];
  outputs: WshMultisigPsbtOutput[];
  changeAddress: string;
  network: BtcSignerNetwork;
}

// Assembles an unsigned P2WSH multisig PSBT. Every input carries the shared
// `witnessScript` and a `witnessUtxo` locked by the descriptor's scriptPubKey, so
// co-signers can each sign against the wsh(sortedmulti(...)) policy. An output
// without an address is the change, returned to the multisig address.
export function assembleWshMultisigPsbt({
  scriptPubKey,
  witnessScript,
  inputs,
  outputs,
  changeAddress,
  network,
}: AssembleWshMultisigPsbtArgs): string {
  const tx = new btc.Transaction();
  for (const input of inputs) {
    tx.addInput({
      txid: input.txid,
      index: input.vout,
      witnessUtxo: { script: scriptPubKey, amount: BigInt(input.value) },
      witnessScript,
    });
  }
  for (const output of outputs) {
    tx.addOutputAddress(output.address ?? changeAddress, output.value, network);
  }
  return base64.encode(tx.toPSBT());
}

export interface BuildUnsignedMultisigBtcPsbtArgs {
  descriptor: string;
  inputs: WshMultisigPsbtInput[];
  outputs: WshMultisigPsbtOutput[];
  changeAddress: string;
  network: BtcSignerNetwork;
}

// Compiles a `wsh(...)` descriptor and assembles an unsigned multisig PSBT from
// the given coin-selection inputs/outputs. Coin selection itself lives in the
// orchestration layer (@leather.io/services) so this package stays free of a
// services dependency.
export function buildUnsignedMultisigBtcPsbt({
  descriptor,
  inputs,
  outputs,
  changeAddress,
  network,
}: BuildUnsignedMultisigBtcPsbtArgs): string {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  return assembleWshMultisigPsbt({
    scriptPubKey,
    witnessScript,
    inputs,
    outputs,
    changeAddress,
    network,
  });
}

export function psbtBase64ToHex(psbtBase64: string): string {
  return hex.encode(base64.decode(psbtBase64));
}

export interface WshMultisigSignature {
  inputIndex: number;
  signature: string;
}

// Reads the partial signatures a wallet added to a signed P2WSH multisig PSBT,
// one per input. Each `signature` is the DER-encoded ECDSA signature with the
// trailing sighash flag, hex-encoded.
export function extractWshMultisigSignatures(
  signedPsbtHex: string,
  signerPubkey: string
): WshMultisigSignature[] {
  const tx = btc.Transaction.fromPSBT(hex.decode(signedPsbtHex));
  const expectedPubkey = signerPubkey.toLowerCase();
  const signatures: WshMultisigSignature[] = [];
  for (let inputIndex = 0; inputIndex < tx.inputsLength; inputIndex++) {
    const match = tx
      .getInput(inputIndex)
      .partialSig?.find(([pub]) => hex.encode(pub) === expectedPubkey);
    if (!match) continue;
    signatures.push({ inputIndex, signature: hex.encode(match[1]) });
  }
  return signatures;
}
