// These tests sign locally with a known key, so they assert the verifier
// itself: a correct signature must verify, and a signature whose stamped flag
// does not match the digest it was computed over must NOT.
import { hex } from '@scure/base';
import { pubECDSA, pubSchnorr } from '@scure/btc-signer/utils';
import { describe, expect, test } from 'vitest';

import { buildPsbtScenario } from '../builders/psbt';
import { SIGHASH } from '../constants';
import { collectSignatures, parsePsbt, verifyPsbtSignatures } from './psbt-signatures';

// A fixed key so every run produces the same transaction.
const privateKey = hex.decode('1'.repeat(63) + '1');
const publicKey = pubECDSA(privateKey);
const taprootInternalKey = pubSchnorr(privateKey);

function unsignedPsbt(sighash: number | undefined, kind: 'p2wpkh' | 'p2tr' = 'p2wpkh'): string {
  const { psbtHex } = buildPsbtScenario(
    {
      inputs: [{ kind, sighash }],
      outputs: [{ kind: 'self', amount: 40_000n }, { kind: 'self' }],
    },
    { nativeSegwitPubkey: publicKey, taprootInternalKey }
  );
  return psbtHex;
}

function signedPsbt(sighash: number | undefined, kind: 'p2wpkh' | 'p2tr' = 'p2wpkh'): string {
  const tx = parsePsbt(unsignedPsbt(sighash, kind));
  tx.signIdx(privateKey, 0, [
    SIGHASH.DEFAULT,
    SIGHASH.ALL,
    SIGHASH.NONE,
    SIGHASH.SINGLE,
    SIGHASH.ALL_ANYONECANPAY,
    SIGHASH.NONE_ANYONECANPAY,
    SIGHASH.SINGLE_ANYONECANPAY,
  ]);
  return hex.encode(tx.toPSBT());
}

describe('verifyPsbtSignatures', () => {
  test('accepts a correct native-segwit signature and reads its flag', () => {
    const [report] = verifyPsbtSignatures(signedPsbt(SIGHASH.SINGLE_ANYONECANPAY));
    expect(report.signed).toBe(true);
    expect(report.kind).toBe('ecdsa');
    expect(report.sighash).toBe(SIGHASH.SINGLE_ANYONECANPAY);
    expect(report.sighashName).toBe('SINGLE|ANYONECANPAY');
    expect(report.matchesDeclared).toBe(true);
    expect(report.valid).toBe(true);
  });

  test('reads ALL as the default when the input declares no flag', () => {
    const [report] = verifyPsbtSignatures(signedPsbt(undefined));
    expect(report.sighash).toBe(SIGHASH.ALL);
    expect(report.matchesDeclared).toBe(true);
    expect(report.valid).toBe(true);
  });

  test('accepts a taproot key-path signature against the tweaked key', () => {
    const [report] = verifyPsbtSignatures(signedPsbt(undefined, 'p2tr'));
    expect(report.kind).toBe('schnorr');
    expect(report.sighash).toBe(SIGHASH.DEFAULT);
    expect(report.valid).toBe(true);
  });

  test('rejects a signature stamped with a flag it was not computed over', () => {
    // Take a valid ALL signature, restamp it as SINGLE, and attach it to an
    // otherwise untouched copy of the same transaction. Everything else is
    // byte-identical, so only a verifier that recomputes the digest catches it.
    const [signature] = collectSignatures(parsePsbt(signedPsbt(SIGHASH.ALL)));
    const forged = new Uint8Array(signature.signature);
    forged[forged.length - 1] = SIGHASH.SINGLE;

    const unsigned = parsePsbt(unsignedPsbt(SIGHASH.ALL));
    unsigned.updateInput(0, { partialSig: [[signature.pubkey, forged]] }, true);

    const [report] = verifyPsbtSignatures(hex.encode(unsigned.toPSBT()));
    expect(report.sighash).toBe(SIGHASH.SINGLE);
    expect(report.valid).toBe(false);
  });

  test('reports an unsigned input rather than pretending it passed', () => {
    const { psbtHex } = buildPsbtScenario(
      { inputs: [{ kind: 'p2wpkh' }] },
      { nativeSegwitPubkey: publicKey }
    );
    const [report] = verifyPsbtSignatures(psbtHex);
    expect(report.signed).toBe(false);
    expect(report.valid).toBe(false);
  });

  test('flags a mismatch between the signature flag and the declared flag', () => {
    const tx = parsePsbt(signedPsbt(SIGHASH.ALL));
    const [signature] = collectSignatures(tx);
    // Leave the signature alone; change what the input claims to want.
    tx.updateInput(0, { sighashType: SIGHASH.NONE }, true);
    const reports = verifyPsbtSignatures(hex.encode(tx.toPSBT()));
    const report = reports.find(candidate => candidate.pubkey === hex.encode(signature.pubkey));
    expect(report?.matchesDeclared).toBe(false);
  });
});
