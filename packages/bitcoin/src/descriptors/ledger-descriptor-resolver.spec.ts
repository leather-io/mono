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

function fingerprintToBytes(fingerprint: number): Uint8Array {
  return hexToBytes(fingerprintAsNumberToHex(fingerprint));
}

const accountRootKeychain = makeRootKeychain(1);
const accountKeychain = accountRootKeychain.derive(accountPath);
const cosignerRootKeychain = makeRootKeychain(2);
const cosignerKeychain = cosignerRootKeychain.derive(accountPath);
const cosignerFingerprint = fingerprintToBytes(cosignerRootKeychain.fingerprint);
const cosignerPublicKey = requireBytes(cosignerKeychain.derive('m/0/7').publicKey);
const descriptor = `wsh(multi(2,${bytesToHex(cosignerPublicKey)},${accountKeychain.publicExtendedKey}/0/7))`;

function buildPsbt(inputCount = 1): Psbt {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  const tx = new btc.Transaction({ allowUnknownInputs: true });
  for (const index of Array.from({ length: inputCount }, (_, index) => index)) {
    tx.addInput({
      txid: hexToBytes(index.toString(16).padStart(2, '0').repeat(32)),
      index: 0,
      witnessUtxo: { script: scriptPubKey, amount: 20_000n },
      witnessScript,
    });
  }
  tx.addOutput({
    script: btc.p2wpkh(requireBytes(makeRootKeychain(3).derive(addressPath).publicKey)).script,
    amount: 18_000n,
  });
  return Psbt.fromBuffer(tx.toPSBT());
}

function addGlobalXpub(
  psbt: Psbt,
  keychain = cosignerKeychain,
  fingerprint = cosignerFingerprint
): void {
  psbt.updateGlobal({
    globalXpub: [
      {
        extendedPubkey: base58check.decode(keychain.publicExtendedKey),
        masterFingerprint: fingerprint,
        path: accountPath,
      },
    ],
  });
}

function addInputDerivation(psbt: Psbt, inputIndex: number, path = addressPath): void {
  psbt.updateInput(inputIndex, {
    bip32Derivation: [
      {
        masterFingerprint: cosignerFingerprint,
        pubkey: cosignerPublicKey,
        path,
      },
    ],
  });
}

function resolveDescriptor(psbt: Psbt, inputIndexes = [0]) {
  const compiled = compileWshDescriptor(descriptor);
  const accountDescriptorKey = findAccountDescriptorKey(compiled, accountKeychain);
  if (!accountDescriptorKey) throw new Error('Expected account descriptor key');
  return resolveLedgerSignableDescriptor({
    descriptor,
    psbt: psbt.toBuffer(),
    inputIndexes,
    accountKey: accountDescriptorKey.key,
  });
}

describe(resolveLedgerSignableDescriptor.name, () => {
  test('replaces a raw public key with its verified global xpub expression', () => {
    const psbt = buildPsbt();
    addGlobalXpub(psbt);
    addInputDerivation(psbt, 0);

    const result = resolveDescriptor(psbt);

    expect(result.status).toBe('success');
    if (result.status !== 'success') return;
    expect(result.descriptor).toContain(
      `[${bytesToHex(cosignerFingerprint)}/84'/0'/0']${cosignerKeychain.publicExtendedKey}/0/7`
    );
    expect(result.descriptor).not.toContain(bytesToHex(cosignerPublicKey));
    expect(bytesToHex(compileWshDescriptor(result.descriptor).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(descriptor).scriptPubKey)
    );
  });

  test('requires an input derivation for every raw public key', () => {
    const psbt = buildPsbt();
    addGlobalXpub(psbt);

    expect(resolveDescriptor(psbt)).toEqual({
      status: 'error',
      reason: 'missing-input-derivation',
      publicKey: bytesToHex(cosignerPublicKey),
    });
  });

  test('requires a matching global xpub', () => {
    const psbt = buildPsbt();
    addInputDerivation(psbt, 0);

    expect(resolveDescriptor(psbt)).toEqual({
      status: 'error',
      reason: 'missing-global-xpub',
      publicKey: bytesToHex(cosignerPublicKey),
    });
  });

  test('rejects inconsistent derivations across descriptor inputs', () => {
    const psbt = buildPsbt(2);
    addGlobalXpub(psbt);
    addInputDerivation(psbt, 0);
    addInputDerivation(psbt, 1, `${accountPath}/0/8`);

    expect(resolveDescriptor(psbt, [0, 1])).toEqual({
      status: 'error',
      reason: 'inconsistent-input-derivation',
      publicKey: bytesToHex(cosignerPublicKey),
    });
  });

  test('rejects a global xpub that does not derive the raw public key', () => {
    const psbt = buildPsbt();
    addGlobalXpub(psbt, makeRootKeychain(4).derive(accountPath));
    addInputDerivation(psbt, 0);

    expect(resolveDescriptor(psbt)).toEqual({
      status: 'error',
      reason: 'incompatible-global-xpub',
      publicKey: bytesToHex(cosignerPublicKey),
    });
  });
});
