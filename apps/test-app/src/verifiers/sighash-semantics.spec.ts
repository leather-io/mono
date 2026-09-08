// The semantics checker has to be right about what each flag commits to,
// otherwise it would report a wallet bug for correct behaviour. These tests
// sign locally with every flag and assert the checker passes each one.
import { hex } from '@scure/base';
import { pubECDSA } from '@scure/btc-signer/utils';
import { describe, expect, test } from 'vitest';

import { buildPsbtScenario } from '../builders/psbt';
import { SIGHASH } from '../constants';
import { parsePsbt } from './psbt-signatures';
import { verifySighashSemantics } from './sighash-semantics';

const privateKey = hex.decode('2'.repeat(63) + '2');
const publicKey = pubECDSA(privateKey);

const allFlags = [
  SIGHASH.ALL,
  SIGHASH.NONE,
  SIGHASH.SINGLE,
  SIGHASH.ALL_ANYONECANPAY,
  SIGHASH.NONE_ANYONECANPAY,
  SIGHASH.SINGLE_ANYONECANPAY,
];

function signWith(flag: number): string {
  const { psbtHex } = buildPsbtScenario(
    {
      // Two inputs and two outputs so both mutations apply and SINGLE has an
      // output at its own index.
      inputs: [{ kind: 'p2wpkh', sighash: flag, count: 2 }],
      outputs: [{ kind: 'self', amount: 40_000n }, { kind: 'self' }],
    },
    { nativeSegwitPubkey: publicKey }
  );
  const tx = parsePsbt(psbtHex);
  tx.signIdx(privateKey, 0, allFlags);
  return hex.encode(tx.toPSBT());
}

describe('verifySighashSemantics', () => {
  test.each(allFlags)('a correctly signed 0x%s passes every mutation check', flag => {
    const report = verifySighashSemantics(signWith(flag));
    const failures = report.checks.filter(check => !check.ok);
    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
    expect(report.ok).toBe(true);
  });

  test('ANYONECANPAY survives a new input while ALL does not', () => {
    const anyoneCanPay = verifySighashSemantics(signWith(SIGHASH.ALL_ANYONECANPAY));
    const all = verifySighashSemantics(signWith(SIGHASH.ALL));
    const label = 'add an unrelated input';
    // Both must PASS: the checker's expectation differs per flag, and each
    // signature has to behave the way its own flag promises.
    expect(anyoneCanPay.checks.find(check => check.label.includes(label))?.ok).toBe(true);
    expect(all.checks.find(check => check.label.includes(label))?.ok).toBe(true);
    expect(anyoneCanPay.checks.find(check => check.label.includes(label))?.detail).toContain(
      'may be added'
    );
    expect(all.checks.find(check => check.label.includes(label))?.detail).toContain(
      'must invalidate'
    );
  });

  test('reports no signatures rather than passing vacuously', () => {
    const { psbtHex } = buildPsbtScenario(
      { inputs: [{ kind: 'p2wpkh' }] },
      { nativeSegwitPubkey: publicKey }
    );
    const report = verifySighashSemantics(psbtHex);
    expect(report.ok).toBe(false);
  });
});
