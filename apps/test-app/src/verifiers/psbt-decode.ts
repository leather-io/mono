// Turns a PSBT into something readable: which address each input spends, what
// each output pays, the fee, and which signatures are attached. The response
// panel renders this instead of a hex blob.
//
// Pure: no React, no `window`.
import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

import { getBtcSignerLibNetworkConfigByMode } from '@leather.io/bitcoin';

import type { NetworkMode } from '../types';
import { parsePsbt, sighashName } from './psbt-signatures';

export interface DecodedPsbtInput {
  index: number;
  address?: string;
  script: string;
  amount: string;
  sighashType?: number;
  sighash?: string;
  hasWitnessScript: boolean;
  signatureCount: number;
  finalized: boolean;
}

export interface DecodedPsbtOutput {
  index: number;
  address?: string;
  script: string;
  amount: string;
  isOpReturn: boolean;
}

export interface DecodedPsbt {
  inputs: DecodedPsbtInput[];
  outputs: DecodedPsbtOutput[];
  totalInput: string;
  totalOutput: string;
  fee: string;
}

/** Address for a scriptPubKey, or undefined for scripts without one. */
export function addressForScript(script: Uint8Array, mode: NetworkMode): string | undefined {
  try {
    const decoded = btc.OutScript.decode(script);
    if (decoded.type === 'unknown') return undefined;
    return btc.Address(getBtcSignerLibNetworkConfigByMode(mode)).encode(decoded);
  } catch {
    return undefined;
  }
}

function isOpReturn(script: Uint8Array): boolean {
  return script.length > 0 && script[0] === 0x6a;
}

export function decodePsbt(psbtHex: string, mode: NetworkMode): DecodedPsbt {
  const tx = parsePsbt(psbtHex);

  let totalInput = 0n;
  const inputs: DecodedPsbtInput[] = [];
  for (let index = 0; index < tx.inputsLength; index += 1) {
    const input = tx.getInput(index);
    const utxo = input.witnessUtxo;
    const amount = utxo?.amount ?? 0n;
    totalInput += amount;
    inputs.push({
      index,
      address: utxo ? addressForScript(utxo.script, mode) : undefined,
      script: utxo ? hex.encode(utxo.script) : '',
      amount: amount.toString(),
      sighashType: input.sighashType,
      sighash: input.sighashType === undefined ? undefined : sighashName(input.sighashType),
      hasWitnessScript: !!input.witnessScript,
      signatureCount: (input.partialSig?.length ?? 0) + (input.tapKeySig ? 1 : 0),
      finalized: !!input.finalScriptWitness,
    });
  }

  let totalOutput = 0n;
  const outputs: DecodedPsbtOutput[] = [];
  for (let index = 0; index < tx.outputsLength; index += 1) {
    const output = tx.getOutput(index);
    const script = output.script ?? new Uint8Array();
    const amount = output.amount ?? 0n;
    totalOutput += amount;
    outputs.push({
      index,
      address: addressForScript(script, mode),
      script: hex.encode(script),
      amount: amount.toString(),
      isOpReturn: isOpReturn(script),
    });
  }

  return {
    inputs,
    outputs,
    totalInput: totalInput.toString(),
    totalOutput: totalOutput.toString(),
    fee: (totalInput - totalOutput).toString(),
  };
}
