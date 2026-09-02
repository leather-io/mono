// The scenario builder has to be deterministic — the UI and Playwright send
// the same bytes — and it has to balance amounts, or the wallet rejects a
// transaction for reasons that have nothing to do with what is being tested.
import { hex } from '@scure/base';
import { pubECDSA, pubSchnorr } from '@scure/btc-signer/utils';
import { describe, expect, test } from 'vitest';

import { SIGHASH } from '../constants';
import { parsePsbt } from '../verifiers/psbt-signatures';
import { sortedMultiDescriptor } from './descriptors';
import { buildPsbtScenario, deriveVaultKey } from './psbt';

const privateKey = hex.decode('3'.repeat(63) + '3');
const keys = {
  nativeSegwitPubkey: pubECDSA(privateKey),
  taprootInternalKey: pubSchnorr(privateKey),
};

describe('buildPsbtScenario', () => {
  test('is deterministic for the same config and keys', () => {
    const config = { inputs: [{ kind: 'p2wpkh' as const }] };
    expect(buildPsbtScenario(config, keys).psbtHex).toBe(buildPsbtScenario(config, keys).psbtHex);
  });

  test('repeats an input `count` times and reports each one', () => {
    const scenario = buildPsbtScenario({ inputs: [{ kind: 'p2wpkh', count: 3 }] }, keys);
    expect(scenario.inputs).toHaveLength(3);
    expect(parsePsbt(scenario.psbtHex).inputsLength).toBe(3);
  });

  test('sets PSBT_IN_SIGHASH_TYPE only when a flag was asked for', () => {
    const withFlag = parsePsbt(
      buildPsbtScenario({ inputs: [{ kind: 'p2wpkh', sighash: SIGHASH.NONE }] }, keys).psbtHex
    );
    const without = parsePsbt(buildPsbtScenario({ inputs: [{ kind: 'p2wpkh' }] }, keys).psbtHex);
    expect(withFlag.getInput(0).sighashType).toBe(SIGHASH.NONE);
    expect(without.getInput(0).sighashType).toBeUndefined();
  });

  test('balances outputs so exactly the fee is left over', () => {
    const scenario = buildPsbtScenario(
      {
        inputs: [{ kind: 'p2wpkh', amount: 100_000n }],
        outputs: [{ kind: 'foreign', amount: 20_000n }, { kind: 'self' }],
        fee: 1_000n,
      },
      keys
    );
    const tx = parsePsbt(scenario.psbtHex);
    let out = 0n;
    for (let index = 0; index < tx.outputsLength; index += 1)
      out += tx.getOutput(index).amount ?? 0n;
    expect(scenario.totalInput - out).toBe(1_000n);
  });

  test('refuses a scenario whose outputs and fee exceed its inputs', () => {
    expect(() =>
      buildPsbtScenario(
        {
          inputs: [{ kind: 'p2wpkh', amount: 1_000n }],
          outputs: [{ kind: 'foreign', amount: 5_000n }, { kind: 'self' }],
        },
        keys
      )
    ).toThrow('exceed the inputs');
  });

  test('an OP_RETURN output carries no value and is not paid for', () => {
    const scenario = buildPsbtScenario(
      { inputs: [{ kind: 'p2wpkh' }], outputs: [{ kind: 'op-return' }, { kind: 'self' }] },
      keys
    );
    const tx = parsePsbt(scenario.psbtHex);
    expect(tx.getOutput(0).amount).toBe(0n);
    expect(tx.getOutput(0).script?.[0]).toBe(0x6a);
  });

  test('a taproot input carries its internal key so the wallet can tweak it', () => {
    const tx = parsePsbt(buildPsbtScenario({ inputs: [{ kind: 'p2tr' }] }, keys).psbtHex);
    expect(tx.getInput(0).tapInternalKey).toEqual(keys.taprootInternalKey);
  });

  test('a foreign input is locked by a key the wallet does not hold', () => {
    const scenario = buildPsbtScenario({ inputs: [{ kind: 'foreign' }] }, keys);
    expect(scenario.inputs[0].expectedSigner).toBeUndefined();
  });

  test('a sortedmulti input carries the vault witness script and descriptor', () => {
    const ownXpub =
      'xpub6ExB1kZYquka4AHMBsA16K5QDEDQuaCgp4Scqenr1y8kmkc4mgEJtPqAYHrywBM8tZAgpbs5vgnnyvospAJCAamEaBBF8RhqhrEtCQVbgpW';
    const cosigner =
      'xpub6EJrJUabyEuwV6bwVton15y57rSH27Mnv4h1gKVhYs7md8P9i1QWxhdGpHF4KtCSLYoEMvu7uNXhkM1287XhCrwi2VCjpqwH3HADqzaLqPW';
    const vaultDescriptor = sortedMultiDescriptor({ ownXpub, cosignerXpubs: [cosigner] });
    const scenario = buildPsbtScenario(
      { inputs: [{ kind: 'sortedmulti' }] },
      { vaultDescriptor, ownXpub, vaultAccountIndex: 0 }
    );
    expect(scenario.descriptor).toBe(vaultDescriptor);
    expect(parsePsbt(scenario.psbtHex).getInput(0).witnessScript).toBeDefined();
    expect(scenario.inputs[0].expectedSigner).toBe(hex.encode(deriveVaultKey(ownXpub, 0)));
  });
});
