import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { pubECDSA, pubSchnorr } from '@scure/btc-signer/utils';
import { describe, expect, test } from 'vitest';

import { type Prevout, findInputProblem } from './bitcoin-signatures';

const ownKey = hexToBytes('11'.repeat(32));
const otherKey = hexToBytes('22'.repeat(32));
const segwitTxid = 'ab'.repeat(32);
const taprootTxid = 'cd'.repeat(32);
const segwitPrevout: Prevout = { script: btc.p2wpkh(pubECDSA(ownKey)).script, amount: 60_000n };
const taprootPrevout: Prevout = { script: btc.p2tr(pubSchnorr(ownKey)).script, amount: 40_000n };

function served(txid: string, vout: number): Prevout[] {
  if (txid === segwitTxid && vout === 1) return [segwitPrevout];
  if (txid === taprootTxid && vout === 0) return [taprootPrevout];
  return [];
}

const foreignTaproot: Prevout = {
  script: btc.p2tr(pubSchnorr(otherKey)).script,
  amount: 40_000n,
};

function servedWithForeignTaproot(txid: string, vout: number): Prevout[] {
  return txid === taprootTxid ? [foreignTaproot, ...served(txid, vout)] : served(txid, vout);
}

interface SpendOptions {
  segwitSigner?: Uint8Array;
  segwitSignedAmount?: bigint;
  taprootSignedAmount?: bigint;
  segwitTxidOverride?: string;
}

function spend({
  segwitSigner = ownKey,
  segwitSignedAmount = segwitPrevout.amount,
  taprootSignedAmount = taprootPrevout.amount,
  segwitTxidOverride = segwitTxid,
}: SpendOptions = {}) {
  const tx = new btc.Transaction();
  tx.addInput({
    txid: segwitTxidOverride,
    index: 1,
    witnessUtxo: { script: btc.p2wpkh(pubECDSA(segwitSigner)).script, amount: segwitSignedAmount },
  });
  tx.addInput({
    txid: taprootTxid,
    index: 0,
    witnessUtxo: { script: taprootPrevout.script, amount: taprootSignedAmount },
    tapInternalKey: pubSchnorr(ownKey),
  });
  tx.addOutput({ script: btc.p2wpkh(pubECDSA(otherKey)).script, amount: 90_000n });
  tx.signIdx(segwitSigner, 0);
  tx.signIdx(ownKey, 1);
  tx.finalize();
  return btc.Transaction.fromRaw(tx.extract(), { allowUnknownOutputs: true });
}

function withWitness(tx: btc.Transaction, index: number, witness: Uint8Array[]) {
  const copy = btc.Transaction.fromRaw(tx.toBytes(true, true), { allowUnknownOutputs: true });
  copy.updateInput(index, { finalScriptWitness: witness }, true);
  return copy;
}

function flipByte(bytes: Uint8Array, index: number) {
  const copy = Uint8Array.from(bytes);
  copy[index] = (copy[index] ?? 0) ^ 1;
  return copy;
}

describe('findInputProblem', () => {
  test('accepts segwit and taproot inputs signed over the served prevouts', () => {
    expect(findInputProblem(spend(), served)).toBeUndefined();
  });

  test('rejects an input the mock never served', () => {
    expect(findInputProblem(spend({ segwitTxidOverride: 'ef'.repeat(32) }), served)).toBe(
      'missing-input'
    );
  });

  test('rejects a segwit signature over another amount', () => {
    expect(findInputProblem(spend({ segwitSignedAmount: 59_999n }), served)).toBe('bad-signature');
  });

  test('rejects a taproot signature over another amount', () => {
    expect(findInputProblem(spend({ taprootSignedAmount: 39_999n }), served)).toBe('bad-signature');
  });

  test('rejects a served input signed by a key that does not own it', () => {
    expect(findInputProblem(spend({ segwitSigner: otherKey }), served)).toBe('bad-signature');
  });

  test('rejects garbage segwit and taproot signatures', () => {
    const tx = spend();
    const [segwitSignature, segwitKey] = tx.getInput(0).finalScriptWitness ?? [];
    const [taprootSignature] = tx.getInput(1).finalScriptWitness ?? [];
    if (!segwitSignature || !segwitKey || !taprootSignature) throw new Error('not signed');
    const badSegwit = withWitness(tx, 0, [flipByte(segwitSignature, 10), segwitKey]);
    const badTaproot = withWitness(tx, 1, [flipByte(taprootSignature, 40)]);
    expect(bytesToHex(badTaproot.getInput(1).finalScriptWitness?.[0] ?? new Uint8Array())).not.toBe(
      bytesToHex(taprootSignature)
    );
    expect(findInputProblem(badSegwit, served)).toBe('bad-signature');
    expect(findInputProblem(badTaproot, served)).toBe('bad-signature');
  });

  test('accepts when one of several candidates at an outpoint verifies', () => {
    expect(findInputProblem(spend(), servedWithForeignTaproot)).toBeUndefined();
  });
});
