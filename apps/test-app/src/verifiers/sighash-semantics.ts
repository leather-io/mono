// Proves a sighash flag commits to what it claims.
//
// Verifying a signature against its own digest shows the wallet computed
// something consistent; it does not show the flag means anything. So each
// signature is re-checked against MUTATED copies of the transaction: an
// ANYONECANPAY signature must survive a new input, a SINGLE signature must
// survive a change to somebody else's output and must break on its own, an
// ALL signature must break on any change at all.
//
// All local — no wallet, no network, no funds.
import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

import type { VerifyCheck, VerifyReport } from '../types';
import {
  type FoundSignature,
  checkSignature,
  collectSignatures,
  parsePsbt,
  sighashName,
} from './psbt-signatures';

const anyoneCanPayBit = 0x80;
const baseFlagMask = 0x7f;

const sighashAll = 0x01;
const sighashNone = 0x02;
const sighashSingle = 0x03;

const unrelatedScript = btc.p2wpkh(
  hex.decode('03519a011b2544949be153baa0c204ad2140d8779fc53ec6085101b62464165e6d')
).script;

const mutationInputValue = 50_000n;

function isAnyoneCanPay(flag: number): boolean {
  return (flag & anyoneCanPayBit) !== 0;
}

/** DEFAULT (taproot) commits to everything, exactly like ALL. */
function baseFlag(flag: number): number {
  const base = flag & baseFlagMask;
  return base === 0 ? sighashAll : base;
}

interface Mutation {
  label: string;
  /** Returns false when the mutation does not apply to this transaction. */
  apply(tx: btc.Transaction, signature: FoundSignature): boolean;
  /** Whether the signature is expected to still verify afterwards. */
  survives(flag: number, signature: FoundSignature, tx: btc.Transaction): boolean;
  because(flag: number): string;
}

const mutations: Mutation[] = [
  {
    label: 'add an unrelated input',
    apply(tx) {
      tx.addInput(
        {
          txid: hex.decode('11'.repeat(32)),
          index: 7,
          witnessUtxo: { script: unrelatedScript, amount: mutationInputValue },
        },
        true
      );
      return true;
    },
    survives(flag) {
      return isAnyoneCanPay(flag);
    },
    because(flag) {
      return isAnyoneCanPay(flag)
        ? 'ANYONECANPAY commits to this input only, so another input may be added'
        : 'the flag commits to every input, so adding one must invalidate it';
    },
  },
  {
    label: 'change another output',
    apply(tx, signature) {
      const target = pickOtherOutput(tx, signature.index);
      if (target === undefined) return false;
      const output = tx.getOutput(target);
      if (!output.script) return false;
      tx.updateOutput(target, { amount: (output.amount ?? 0n) + 1n }, true);
      return true;
    },
    survives(flag, signature, tx) {
      const base = baseFlag(flag);
      if (base === sighashNone) return true;
      // SINGLE only commits to the output at the input's own index, so a
      // change anywhere else leaves the signature valid.
      return base === sighashSingle && pickOtherOutput(tx, signature.index) !== signature.index;
    },
    because(flag) {
      const base = baseFlag(flag);
      if (base === sighashNone) return 'NONE commits to no outputs';
      if (base === sighashSingle) return 'SINGLE commits only to the output at this input index';
      return 'ALL commits to every output';
    },
  },
  {
    label: 'change this input’s own output',
    apply(tx, signature) {
      if (signature.index >= tx.outputsLength) return false;
      const output = tx.getOutput(signature.index);
      if (!output.script) return false;
      tx.updateOutput(signature.index, { amount: (output.amount ?? 0n) + 1n }, true);
      return true;
    },
    survives(flag) {
      return baseFlag(flag) === sighashNone;
    },
    because(flag) {
      return baseFlag(flag) === sighashNone
        ? 'NONE commits to no outputs'
        : 'this output is covered by the flag';
    },
  },
];

function pickOtherOutput(tx: btc.Transaction, inputIndex: number): number | undefined {
  for (let index = 0; index < tx.outputsLength; index += 1) {
    if (index !== inputIndex) return index;
  }
  return tx.outputsLength ? 0 : undefined;
}

/**
 * Re-check every signature in `signedPsbtHex` against mutated copies of the
 * transaction and compare the outcome with what its flag promises.
 */
export function verifySighashSemantics(signedPsbtHex: string): VerifyReport {
  const original = parsePsbt(signedPsbtHex);
  const signatures = collectSignatures(original).filter(signature => !signature.finalized);
  const checks: VerifyCheck[] = [];

  if (!signatures.length)
    return {
      ok: false,
      checks: [
        { label: 'signatures present', ok: false, detail: 'No partial signatures to check' },
      ],
    };

  signatures.forEach(signature => {
    const flag = signature.sighash;
    const prefix = `input ${signature.index} (${sighashName(flag)})`;

    checks.push({
      label: `${prefix} verifies as sent`,
      ok: checkSignature(original, signature),
    });

    mutations.forEach(mutation => {
      // A fresh copy per mutation: they must not compound.
      const mutated = parsePsbt(signedPsbtHex);
      if (!mutation.apply(mutated, signature)) {
        checks.push({
          label: `${prefix} — ${mutation.label}`,
          ok: true,
          detail: 'not applicable to this transaction',
        });
        return;
      }
      const stillValid = checkSignature(mutated, signature);
      const expected = mutation.survives(flag, signature, original);
      checks.push({
        label: `${prefix} — ${mutation.label}`,
        ok: stillValid === expected,
        detail: `${expected ? 'stays valid' : 'must break'}: ${mutation.because(flag)}${
          stillValid === expected ? '' : ` — but it ${stillValid ? 'stayed valid' : 'broke'}`
        }`,
      });
    });
  });

  return { ok: checks.every(check => check.ok), checks };
}
