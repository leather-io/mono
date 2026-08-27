import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { createBase58check } from '@scure/base';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';
import { describe, expect, test } from 'vitest';

import { fingerprintAsNumberToHex } from '@leather.io/crypto';

import { resolveLedgerSignableDescriptor } from './ledger-descriptor-resolver';
import { compileWshDescriptor, findAccountDescriptorKey } from './wsh-descriptor';

const base58check = createBase58check(sha256);
const accountPath = "m/84'/0'/0'";
const addressPath = `${accountPath}/0/7`;

function requireBytes(value: Uint8Array | null | undefined): Uint8Array {
  if (!value) throw new Error('Expected bytes');
  return value;
}

function makeRootKeychain(seedByte: number): HDKey {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte));
}

const accountKeychain = makeRootKeychain(1).derive(accountPath);
const cosignerRootKeychain = makeRootKeychain(2);
const cosignerKeychain = cosignerRootKeychain.derive(accountPath);
const cosignerFingerprint = hexToBytes(fingerprintAsNumberToHex(cosignerRootKeychain.fingerprint));
const cosignerPublicKey = requireBytes(cosignerKeychain.derive('m/0/7').publicKey);
const descriptor = `wsh(multi(2,${bytesToHex(cosignerPublicKey)},${accountKeychain.publicExtendedKey}/0/7))`;

function buildPsbt(): Psbt {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  const tx = new btc.Transaction({ allowUnknownInputs: true });
  tx.addInput({
    txid: hexToBytes('00'.repeat(32)),
    index: 0,
    witnessUtxo: { script: scriptPubKey, amount: 20_000n },
    witnessScript,
  });
  tx.addOutput({
    script: btc.p2wpkh(requireBytes(makeRootKeychain(3).derive(addressPath).publicKey)).script,
    amount: 18_000n,
  });
  return Psbt.fromBuffer(tx.toPSBT());
}

function addGlobalXpub(psbt: Psbt, keychain = cosignerKeychain): void {
  psbt.updateGlobal({
    globalXpub: [
      {
        extendedPubkey: base58check.decode(keychain.publicExtendedKey),
        masterFingerprint: cosignerFingerprint,
        path: accountPath,
      },
    ],
  });
}

function addInputDerivation(psbt: Psbt): void {
  psbt.updateInput(0, {
    bip32Derivation: [
      { masterFingerprint: cosignerFingerprint, pubkey: cosignerPublicKey, path: addressPath },
    ],
  });
}

function resolveDescriptor(psbt: Psbt) {
  const compiled = compileWshDescriptor(descriptor);
  const accountDescriptorKey = findAccountDescriptorKey(compiled, accountKeychain);
  if (!accountDescriptorKey) throw new Error('Expected account descriptor key');
  return resolveLedgerSignableDescriptor({
    descriptor,
    psbt: psbt.toBuffer(),
    inputIndexes: [0],
    accountKey: accountDescriptorKey.key,
  });
}

describe(resolveLedgerSignableDescriptor.name, () => {
  test('replaces a raw public key with its verified global xpub expression', () => {
    const psbt = buildPsbt();
    addGlobalXpub(psbt);
    addInputDerivation(psbt);

    const resolved = resolveDescriptor(psbt);

    if (!resolved) throw new Error('Expected resolved descriptor');
    expect(resolved).toContain(`${cosignerKeychain.publicExtendedKey}/0/7`);
    expect(resolved).not.toContain(bytesToHex(cosignerPublicKey));
    expect(bytesToHex(compileWshDescriptor(resolved).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(descriptor).scriptPubKey)
    );
  });

  test('returns null without input derivation metadata', () => {
    const psbt = buildPsbt();
    addGlobalXpub(psbt);

    expect(resolveDescriptor(psbt)).toBeNull();
  });

  test('returns null without a global xpub', () => {
    const psbt = buildPsbt();
    addInputDerivation(psbt);

    expect(resolveDescriptor(psbt)).toBeNull();
  });

  test('returns null when the global xpub does not derive the raw public key', () => {
    const psbt = buildPsbt();
    addGlobalXpub(psbt, makeRootKeychain(4).derive(accountPath));
    addInputDerivation(psbt);

    expect(resolveDescriptor(psbt)).toBeNull();
  });
});
