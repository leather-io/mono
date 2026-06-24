import { base64 } from '@scure/base';
import * as btc from '@scure/btc-signer';

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
