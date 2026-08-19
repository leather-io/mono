import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { describe, expect, it } from 'vitest';

import { getBondVaultKeys, instantiateBondDescriptor, matchBondDescriptor } from './bond-template';
import { resolveProposalSigningDescriptor } from './proposal-signing-descriptor';
import { compileWshDescriptor } from './wsh-descriptor';

function makeNativeSegwitAccountXpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'")
    .publicExtendedKey;
}

function makeAddressPubkey(seedByte: number) {
  const { publicKey } = HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte))
    .derive("m/84'/0'/0'")
    .deriveChild(0)
    .deriveChild(0);
  if (!publicKey) throw new Error('Expected key bytes to be defined');
  return publicKey;
}

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const xpubC = makeNativeSegwitAccountXpub(3);
const counterpartyKey = bytesToHex(makeAddressPubkey(9));
const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
const unlockHeight = 1000;

const policyDescriptor = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0,${xpubC}/0/0))`;
const bondDescriptor = instantiateBondDescriptor({
  unlockHeight,
  hash,
  counterpartyKey,
  ...getBondVaultKeys(policyDescriptor),
});

const foreignPolicyDescriptor = `wsh(sortedmulti(2,${makeNativeSegwitAccountXpub(4)}/0/0,${makeNativeSegwitAccountXpub(5)}/0/0))`;
const foreignBondDescriptor = instantiateBondDescriptor({
  unlockHeight,
  hash,
  counterpartyKey,
  ...getBondVaultKeys(foreignPolicyDescriptor),
});

interface PsbtInputFixture {
  script: Uint8Array;
  witnessScript?: Uint8Array;
}

const recipientScript = btc.p2wpkh(makeAddressPubkey(8)).script;

function buildPsbtHex(inputs: PsbtInputFixture[]) {
  const tx = new btc.Transaction({ allowUnknownInputs: true });
  inputs.forEach((input, index) => {
    tx.addInput({
      txid: hexToBytes('11'.repeat(32)),
      index,
      witnessUtxo: { script: input.script, amount: 50_000n },
      ...(input.witnessScript ? { witnessScript: input.witnessScript } : {}),
    });
  });
  tx.addOutput({ script: recipientScript, amount: 45_000n });
  return bytesToHex(tx.toPSBT());
}

function descriptorInputFixture(descriptor: string): PsbtInputFixture {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  return { script: scriptPubKey, witnessScript };
}

// Real staging bond-exit proposal: vault policy, the bond witnessScript stored on
// the proposal PSBT, and the bond scriptPubKey its inputs are locked by.
const stagingPolicyDescriptor =
  'wsh(sortedmulti(1,tpubDDtKRowEfGJVzGfuiWUm5mMX96BahRfgSrqvWerhKb9P5ZZapstcRnHAgQpkx2BnSayMeLw61u48qHA3eQszUKuRwVKikjzCrFuRYZBo2Cg/0/0,tpubDDtKRowEfGJVvxz9LYyjzcQJfYZuokGJqjzru8arfVoz7B31SP7LdqKaZnk2GSXdp9b4k5ccVYASy2TWU5vfm5duhVwNe6mDKC2xnZt8WAy/0/0))';
const stagingBondWitnessScript =
  '6304ff64cd1db16782012088a820dbc1454203791389c7a6c24cbfcb4db42e1434fd0b6c0b682c90334507f47b99882102b31fba61bbe4ee3753a72f4681c0d1ada9ecf23cff309a20a90af3201a37f5a0ac68695121032bfc45f5dec5ba404da7ca12d3120dd67350bd72607eec3990bbb31611b454a021039236b5534c437a2bf0b59963d57771c3f88687b4b3f90b35703dce4acd3879f452ae';
const stagingBondScriptPubKey =
  '002056818c78310976991f0425fcb27228cd718335bf5ab0d675e4a9245633fb585f';

describe(resolveProposalSigningDescriptor.name, () => {
  it('returns the policy descriptor for a plain multisig proposal', () => {
    const input = descriptorInputFixture(policyDescriptor);
    const psbtHex = buildPsbtHex([input, input]);
    expect(resolveProposalSigningDescriptor(policyDescriptor, psbtHex)).toBe(policyDescriptor);
  });

  it('reconstructs the bond descriptor for a bond proposal', () => {
    const input = descriptorInputFixture(bondDescriptor);
    const psbtHex = buildPsbtHex([input, input]);
    const resolved = resolveProposalSigningDescriptor(policyDescriptor, psbtHex);
    expect(resolved).toBe(bondDescriptor);
    expect(bytesToHex(compileWshDescriptor(resolved).scriptPubKey)).toBe(bytesToHex(input.script));
  });

  it('reconstructs the real staging bond proposal', () => {
    const psbtHex = buildPsbtHex([
      {
        script: hexToBytes(stagingBondScriptPubKey),
        witnessScript: hexToBytes(stagingBondWitnessScript),
      },
    ]);
    const resolved = resolveProposalSigningDescriptor(stagingPolicyDescriptor, psbtHex);
    expect(matchBondDescriptor(resolved)).toMatchObject({
      unlockHeight: 499999999,
      hash: 'dbc1454203791389c7a6c24cbfcb4db42e1434fd0b6c0b682c90334507f47b99',
      counterpartyKey: '02b31fba61bbe4ee3753a72f4681c0d1ada9ecf23cff309a20a90af3201a37f5a0',
    });
    expect(bytesToHex(compileWshDescriptor(resolved).scriptPubKey)).toBe(stagingBondScriptPubKey);
    expect(bytesToHex(compileWshDescriptor(resolved).witnessScript)).toBe(stagingBondWitnessScript);
  });

  it('never resolves a bond whose multi leaf is not the vault key set', () => {
    const input = descriptorInputFixture(foreignBondDescriptor);
    const psbtHex = buildPsbtHex([input]);
    expect(() => resolveProposalSigningDescriptor(policyDescriptor, psbtHex)).toThrow(/key set/);
  });

  it('rejects a proposal mixing bond inputs with foreign inputs', () => {
    const psbtHex = buildPsbtHex([
      descriptorInputFixture(bondDescriptor),
      { script: btc.p2wpkh(makeAddressPubkey(7)).script },
    ]);
    expect(() => resolveProposalSigningDescriptor(policyDescriptor, psbtHex)).toThrow(/mixes/);
  });

  it('rejects a proposal mixing bond inputs with plain policy inputs', () => {
    const bondFirst = buildPsbtHex([
      descriptorInputFixture(bondDescriptor),
      descriptorInputFixture(policyDescriptor),
    ]);
    expect(() => resolveProposalSigningDescriptor(policyDescriptor, bondFirst)).toThrow(/mixes/);

    const policyFirst = buildPsbtHex([
      descriptorInputFixture(policyDescriptor),
      descriptorInputFixture(bondDescriptor),
    ]);
    expect(() => resolveProposalSigningDescriptor(policyDescriptor, policyFirst)).toThrow();
  });

  it('rejects a proposal locked by another vault entirely', () => {
    const psbtHex = buildPsbtHex([descriptorInputFixture(foreignPolicyDescriptor)]);
    expect(() => resolveProposalSigningDescriptor(policyDescriptor, psbtHex)).toThrow(
      /recognized bond/
    );
  });

  it('rejects a non-policy input carrying no witness script', () => {
    const { scriptPubKey } = compileWshDescriptor(bondDescriptor);
    const psbtHex = buildPsbtHex([{ script: scriptPubKey }]);
    expect(() => resolveProposalSigningDescriptor(policyDescriptor, psbtHex)).toThrow(
      /witness script/
    );
  });

  it('rejects a PSBT with no inputs', () => {
    const tx = new btc.Transaction();
    tx.addOutput({ script: recipientScript, amount: 45_000n });
    const psbtHex = bytesToHex(tx.toPSBT());
    expect(() => resolveProposalSigningDescriptor(policyDescriptor, psbtHex)).toThrow(/no inputs/);
  });
});
