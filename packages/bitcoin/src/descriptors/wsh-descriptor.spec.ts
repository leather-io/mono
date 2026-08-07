import { checksum } from '@bitcoinerlab/descriptors';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';
import { describe, expect, it } from 'vitest';

import {
  makeNativeSegwitAccountKeychain,
  makeNativeSegwitAccountXpub,
  makeNativeSegwitAddressPubkey,
} from '../mocks/key-mocks';
import {
  type FinalizeWshDescriptorPsbtResult,
  compileWshDescriptor,
  extractWshDescriptorPreimages,
  finalizeWshDescriptorPsbt,
  findAccountDescriptorKey,
  findAccountKeyByPubkey,
  getDescriptorInputsWithDisallowedSighash,
  getDescriptorMatchingInputIndexes,
  getWshDescriptorAddress,
  getWshDescriptorNetwork,
  getWshDescriptorThreshold,
  isExtendedPublicKeyExpression,
  isSignableWshDescriptor,
  isWshDescriptor,
  makeWshDescriptorInstance,
  toLedgerSignableDescriptor,
} from './wsh-descriptor';

// Testnet extended-key version bytes (tprv / tpub) — Ledger uses these on testnet.
const testnetExtendedKeyVersions = { private: 0x04358394, public: 0x043587cf };
function makeNativeSegwitAccountTpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte), testnetExtendedKeyVersions).derive(
    "m/84'/1'/0'"
  ).publicExtendedKey;
}

// BIP-48 multisig account keys — the derivation coordinators (Sparrow, Specter,
// Caravan) export inside `[fingerprint/48'/coin'/0'/2']xpub` key expressions.
function makeMultisigAccountXpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/48'/0'/0'/2'")
    .publicExtendedKey;
}

function makeMultisigAccountTpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte), testnetExtendedKeyVersions).derive(
    "m/48'/1'/0'/2'"
  ).publicExtendedKey;
}

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const pubkeyA = makeNativeSegwitAddressPubkey(1);
const digest = bytesToHex(sha256(new Uint8Array([1, 2, 3])));

// Mirrors the user's example policy: pk(A) is the current account's key, which
// must always sign, combined with a timelock-or-(hashlock+pk(B)) branch.
const descriptor = `wsh(and_v(v:or_i(after(1000),and_v(v:sha256(${digest}),pk(${xpubB}/0/*))),pk(${xpubA}/0/*)))`;

describe('wsh-descriptor', () => {
  it('recognises wsh descriptors', () => {
    expect(isWshDescriptor(descriptor)).toBe(true);
    expect(isWshDescriptor(`tr(${xpubA}/0/*)`)).toBe(false);
    expect(isWshDescriptor(`wpkh(${xpubA}/0/*)`)).toBe(false);
  });

  it('rejects non-wsh descriptors', () => {
    expect(() => compileWshDescriptor(`wpkh(${xpubA})`)).toThrow();
  });

  it('derives the mainnet p2wsh address for a multisig descriptor', () => {
    const multisigDescriptor = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`;
    const { scriptPubKey } = compileWshDescriptor(multisigDescriptor);
    const address = getWshDescriptorAddress(multisigDescriptor);

    expect(address.startsWith('bc1q')).toBe(true);
    expect(address).toBe(btc.Address(btc.NETWORK).encode(btc.OutScript.decode(scriptPubKey)));
  });

  it('derives the testnet p2wsh address from testnet keys', () => {
    const tpubA = makeMultisigAccountTpub(1);
    const tpubB = makeMultisigAccountTpub(2);
    const testnetDescriptor = `wsh(sortedmulti(2,${tpubA}/0/0,${tpubB}/0/0))`;
    const { scriptPubKey } = compileWshDescriptor(testnetDescriptor);
    const address = getWshDescriptorAddress(testnetDescriptor);

    expect(address.startsWith('tb1q')).toBe(true);
    expect(address).toBe(btc.Address(btc.TEST_NETWORK).encode(btc.OutScript.decode(scriptPubKey)));
  });

  it('derives raw-pubkey-only p2wsh addresses from the explicit network', () => {
    const rawPubkeyDescriptor = `wsh(pk(${bytesToHex(pubkeyA)}))`;
    const { scriptPubKey } = compileWshDescriptor(rawPubkeyDescriptor);
    const mainnetAddress = getWshDescriptorAddress(rawPubkeyDescriptor, 'mainnet');
    const testnetAddress = getWshDescriptorAddress(rawPubkeyDescriptor, 'testnet');

    expect(mainnetAddress.startsWith('bc1q')).toBe(true);
    expect(testnetAddress.startsWith('tb1q')).toBe(true);
    expect(mainnetAddress).toBe(
      btc.Address(btc.NETWORK).encode(btc.OutScript.decode(scriptPubKey))
    );
    expect(testnetAddress).toBe(
      btc.Address(btc.TEST_NETWORK).encode(btc.OutScript.decode(scriptPubKey))
    );
  });

  it('throws for a non-wsh descriptor', () => {
    expect(() => getWshDescriptorAddress(`wpkh(${xpubA})`)).toThrow();
  });

  it('classifies a descriptor with mainnet extended keys as mainnet', () => {
    const mainnetDescriptor = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`;
    expect(getWshDescriptorNetwork(mainnetDescriptor)).toBe('mainnet');
    expect(getWshDescriptorNetwork(descriptor)).toBe('mainnet');
  });

  it('classifies a descriptor with testnet extended keys as testnet', () => {
    const tpubA = makeMultisigAccountTpub(1);
    const tpubB = makeMultisigAccountTpub(2);
    const testnetDescriptor = `wsh(sortedmulti(2,${tpubA}/0/0,${tpubB}/0/0))`;
    expect(getWshDescriptorNetwork(testnetDescriptor)).toBe('testnet');
  });

  it('returns undefined for a raw-pubkey-only descriptor with no network signal', () => {
    const rawPubkeyDescriptor = `wsh(pk(${bytesToHex(pubkeyA)}))`;
    expect(getWshDescriptorNetwork(rawPubkeyDescriptor)).toBeUndefined();
  });

  it('compiles to a p2wsh scriptPubKey and witness script', () => {
    const { scriptPubKey, witnessScript, keys } = compileWshDescriptor(descriptor);

    // P2WSH scriptPubKey is OP_0 <32-byte sha256(witnessScript)>
    expect(scriptPubKey.length).toBe(34);
    expect(scriptPubKey[0]).toBe(0x00);
    expect(scriptPubKey[1]).toBe(0x20);
    expect(bytesToHex(scriptPubKey.slice(2))).toBe(bytesToHex(sha256(witnessScript)));
    expect(witnessScript.length).toBeGreaterThan(0);
    expect(keys.length).toBe(2);
  });

  it('compiles a non-ranged (fixed-path) descriptor', () => {
    const fixedDescriptor = `wsh(and_v(v:after(5),pk(${xpubA}/0/0)))`;
    const { scriptPubKey, witnessScript, keys } = compileWshDescriptor(fixedDescriptor);
    expect(scriptPubKey.length).toBe(34);
    expect(witnessScript.length).toBeGreaterThan(0);
    expect(keys.length).toBe(1);
    expect(findAccountKeyByPubkey(keys, pubkeyA)).toBeDefined();
  });

  it('compiles a raw-pubkey descriptor and matches the account by pubkey', () => {
    const rawPubkeyDescriptor = `wsh(and_v(v:after(5),pk(${bytesToHex(pubkeyA)})))`;
    const { scriptPubKey, witnessScript, keys } = compileWshDescriptor(rawPubkeyDescriptor);
    expect(scriptPubKey.length).toBe(34);
    expect(witnessScript.length).toBeGreaterThan(0);
    expect(keys.length).toBe(1);
    expect(findAccountKeyByPubkey(keys, pubkeyA)).toBeDefined();
  });

  it('finds the account key by pubkey and rejects unrelated accounts', () => {
    const { keys } = compileWshDescriptor(descriptor);
    expect(findAccountKeyByPubkey(keys, pubkeyA)).toBeDefined();
    expect(findAccountKeyByPubkey(keys, makeNativeSegwitAddressPubkey(2))).toBeDefined();
    expect(findAccountKeyByPubkey(keys, makeNativeSegwitAddressPubkey(9))).toBeUndefined();
  });

  it('exposes the key path indexes of a fixed-path descriptor', () => {
    const { keyPathIndexes } = compileWshDescriptor(
      `wsh(sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7))`
    );
    expect(keyPathIndexes).toEqual({ changeIndex: 0, addressIndex: 7 });
  });

  it('exposes the key path indexes of a ranged descriptor resolved at the given index', () => {
    const { keyPathIndexes } = compileWshDescriptor(
      `wsh(sortedmulti(2,${xpubA}/0/*,${xpubB}/0/*))`,
      5
    );
    expect(keyPathIndexes).toEqual({ changeIndex: 0, addressIndex: 5 });
  });

  it('defaults the key path indexes to 0/0 for a raw-pubkey-only descriptor', () => {
    const { keyPathIndexes } = compileWshDescriptor(
      `wsh(and_v(v:after(5),pk(${bytesToHex(pubkeyA)})))`
    );
    expect(keyPathIndexes).toEqual({ changeIndex: 0, addressIndex: 0 });
  });

  it('rejects a descriptor whose extended keys use different key paths', () => {
    expect(() => compileWshDescriptor(`wsh(multi(2,${xpubA}/0/0,${xpubB}/0/3))`)).toThrow(
      'must use the same key path'
    );
  });

  it('rejects a descriptor whose key path is not /0/N or /1/N', () => {
    expect(() => compileWshDescriptor(`wsh(multi(2,${xpubA}/2/0,${xpubB}/2/0))`)).toThrow(
      '/0/N or /1/N'
    );
  });

  it('rejects a descriptor with a pathless extended key', () => {
    expect(() => compileWshDescriptor(`wsh(pk(${xpubA}))`)).toThrow('/0/N or /1/N');
  });

  it('matches the account by xpub at the descriptor key path', () => {
    const accountKeychain = makeNativeSegwitAccountKeychain(1);
    const compiled = compileWshDescriptor(`wsh(sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7))`);

    const match = findAccountDescriptorKey(compiled, accountKeychain)!;
    expect(match.changeIndex).toBe(0);
    expect(match.addressIndex).toBe(7);
    expect(bytesToHex(match.key.pubkey)).toBe(
      bytesToHex(accountKeychain.deriveChild(0).deriveChild(7).publicKey!)
    );
  });

  it('matches the account on the change branch key path', () => {
    const accountKeychain = makeNativeSegwitAccountKeychain(1);
    const compiled = compileWshDescriptor(`wsh(multi(2,${xpubA}/1/4,${xpubB}/1/4))`);

    const match = findAccountDescriptorKey(compiled, accountKeychain)!;
    expect(match.changeIndex).toBe(1);
    expect(match.addressIndex).toBe(4);
  });

  it('matches the account xpub regardless of its serialized version bytes', () => {
    const accountKeychain = makeNativeSegwitAccountKeychain(1);
    const tpubSamePath = HDKey.fromMasterSeed(
      new Uint8Array(32).fill(1),
      testnetExtendedKeyVersions
    ).derive("m/84'/0'/0'").publicExtendedKey;
    const tpubCosigner = HDKey.fromMasterSeed(
      new Uint8Array(32).fill(2),
      testnetExtendedKeyVersions
    ).derive("m/84'/0'/0'").publicExtendedKey;
    const compiled = compileWshDescriptor(`wsh(multi(2,${tpubSamePath}/0/9,${tpubCosigner}/0/9))`);

    const match = findAccountDescriptorKey(compiled, accountKeychain)!;
    expect(match.addressIndex).toBe(9);
    expect(bytesToHex(match.key.pubkey)).toBe(
      bytesToHex(accountKeychain.deriveChild(0).deriveChild(9).publicKey!)
    );
  });

  it('matches a raw-pubkey account key at address index 0/0', () => {
    const accountKeychain = makeNativeSegwitAccountKeychain(1);
    const compiled = compileWshDescriptor(`wsh(and_v(v:after(5),pk(${bytesToHex(pubkeyA)})))`);

    const match = findAccountDescriptorKey(compiled, accountKeychain)!;
    expect(match.changeIndex).toBe(0);
    expect(match.addressIndex).toBe(0);
    expect(match.key.bip32).toBeUndefined();
  });

  it('does not match a raw pubkey derived from a non-zero address index', () => {
    const accountKeychain = makeNativeSegwitAccountKeychain(1);
    const pubkeyAtIndexOne = accountKeychain.deriveChild(0).deriveChild(1).publicKey!;
    const compiled = compileWshDescriptor(
      `wsh(and_v(v:after(5),pk(${bytesToHex(pubkeyAtIndexOne)})))`
    );

    expect(findAccountDescriptorKey(compiled, accountKeychain)).toBeUndefined();
  });

  it('allows a raw-pubkey co-signer alongside extended keys at a non-zero key path', () => {
    const accountKeychain = makeNativeSegwitAccountKeychain(1);
    const cosignerRawPubkey = makeNativeSegwitAddressPubkey(2);
    const compiled = compileWshDescriptor(
      `wsh(multi(2,${bytesToHex(cosignerRawPubkey)},${xpubA}/0/7))`
    );
    expect(compiled.keyPathIndexes).toEqual({ changeIndex: 0, addressIndex: 7 });

    const match = findAccountDescriptorKey(compiled, accountKeychain)!;
    expect(match.addressIndex).toBe(7);
  });

  it('returns undefined when the account does not participate in the descriptor', () => {
    const foreignKeychain = makeNativeSegwitAccountKeychain(9);
    const compiled = compileWshDescriptor(`wsh(sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7))`);

    expect(findAccountDescriptorKey(compiled, foreignKeychain)).toBeUndefined();
  });

  it('rejects an extended key carrying the account pubkey but a different chain code', () => {
    const accountKeychain = makeNativeSegwitAccountKeychain(1);
    const forgedKey = new HDKey({
      publicKey: accountKeychain.publicKey!,
      chainCode: new Uint8Array(32).fill(7),
    });
    expect(forgedKey.publicExtendedKey).not.toBe(accountKeychain.publicExtendedKey);

    const compiled = compileWshDescriptor(
      `wsh(multi(2,${forgedKey.publicExtendedKey}/0/7,${xpubB}/0/7))`
    );

    expect(findAccountDescriptorKey(compiled, accountKeychain)).toBeUndefined();
  });

  it('signs the matched p2wsh input with the account key once the witness script is attached', () => {
    const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);

    // The private key behind pk(A) at index 0: account keychain (seed 1) -> /0/0.
    const signingChild = HDKey.fromMasterSeed(new Uint8Array(32).fill(1))
      .derive("m/84'/0'/0'")
      .deriveChild(0)
      .deriveChild(0);

    const tx = new btc.Transaction({ allowUnknownInputs: true });
    tx.addInput({
      txid: hexToBytes('00'.repeat(32)),
      index: 0,
      witnessUtxo: { script: scriptPubKey, amount: 20_000n },
    });
    tx.addOutput({ script: btc.p2wpkh(signingChild.publicKey!).script, amount: 19_000n });

    const [index] = getDescriptorMatchingInputIndexes(tx, scriptPubKey);
    tx.updateInput(index, { witnessScript });

    const signed = tx.signIdx(signingChild.privateKey!, index);
    expect(signed).toBe(true);

    const partialSig = tx.getInput(index).partialSig;
    expect(partialSig).toBeDefined();
    expect(bytesToHex(partialSig![0][0])).toBe(bytesToHex(signingChild.publicKey!));
  });

  it('matches PSBT inputs locked by the descriptor scriptPubKey', () => {
    const { scriptPubKey } = compileWshDescriptor(descriptor);

    const tx = new btc.Transaction({ allowUnknownInputs: true });
    tx.addInput({
      txid: hexToBytes('00'.repeat(32)),
      index: 0,
      witnessUtxo: { script: scriptPubKey, amount: 10_000n },
    });
    tx.addInput({
      txid: hexToBytes('11'.repeat(32)),
      index: 0,
      witnessUtxo: {
        script: btc.p2wpkh(HDKey.fromMasterSeed(new Uint8Array(32).fill(3)).publicKey!).script,
        amount: 10_000n,
      },
    });

    expect(getDescriptorMatchingInputIndexes(tx, scriptPubKey)).toEqual([0]);
  });

  it('flags descriptor inputs whose requested sighash is not SIGHASH_ALL/DEFAULT', () => {
    const { scriptPubKey } = compileWshDescriptor(descriptor);

    function descriptorTxWithSighash(sighashType?: number) {
      const tx = new btc.Transaction({ allowUnknownInputs: true });
      tx.addInput({
        txid: hexToBytes('00'.repeat(32)),
        index: 0,
        witnessUtxo: { script: scriptPubKey, amount: 10_000n },
        ...(sighashType === undefined ? {} : { sighashType }),
      });
      const matchedIndexes = getDescriptorMatchingInputIndexes(tx, scriptPubKey);
      return getDescriptorInputsWithDisallowedSighash(tx, matchedIndexes);
    }

    expect(descriptorTxWithSighash()).toEqual([]);
    expect(descriptorTxWithSighash(btc.SigHash.DEFAULT)).toEqual([]);
    expect(descriptorTxWithSighash(btc.SigHash.ALL)).toEqual([]);
    expect(descriptorTxWithSighash(btc.SigHash.NONE)).toEqual([0]);
    expect(descriptorTxWithSighash(btc.SigHash.SINGLE_ANYONECANPAY)).toEqual([0]);
    expect(descriptorTxWithSighash(0x82)).toEqual([0]);
  });

  it('builds a descriptor instance whose scriptPubKey matches compileWshDescriptor', () => {
    const instance = makeWshDescriptorInstance(descriptor);
    const { scriptPubKey } = compileWshDescriptor(descriptor);
    expect(bytesToHex(Uint8Array.from(instance.getScriptPubKey()))).toBe(bytesToHex(scriptPubKey));
  });

  it('compiles a checksummed descriptor and matches the unchecksummed scriptPubKey', () => {
    const checksummedDescriptor = `${descriptor}#${checksum(descriptor)}`;
    expect(bytesToHex(compileWshDescriptor(checksummedDescriptor).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(descriptor).scriptPubKey)
    );
  });

  it('compiles sortedmulti() to the BIP67-sorted multi() witness script', () => {
    const pubkeyB = makeNativeSegwitAddressPubkey(2);
    const sortedPubkeys = [pubkeyA, pubkeyB].sort((a, b) =>
      bytesToHex(a) < bytesToHex(b) ? -1 : 1
    );
    const expectedScript = btc.p2ms(2, sortedPubkeys).script;

    const { witnessScript, keys } = compileWshDescriptor(
      `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`
    );
    expect(bytesToHex(witnessScript)).toBe(bytesToHex(expectedScript));
    expect(keys.length).toBe(2);
    expect(findAccountKeyByPubkey(keys, pubkeyA)).toBeDefined();
  });

  it('compiles sortedmulti() identically regardless of key order', () => {
    const ab = compileWshDescriptor(`wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`);
    const ba = compileWshDescriptor(`wsh(sortedmulti(2,${xpubB}/0/0,${xpubA}/0/0))`);
    expect(bytesToHex(ab.scriptPubKey)).toBe(bytesToHex(ba.scriptPubKey));
  });

  it('compiles a ranged sortedmulti() descriptor at the given index', () => {
    const { keys } = compileWshDescriptor(`wsh(sortedmulti(2,${xpubA}/0/*,${xpubB}/0/*))`);
    expect(keys.length).toBe(2);
    expect(findAccountKeyByPubkey(keys, pubkeyA)).toBeDefined();
  });

  it('compiles a checksummed sortedmulti() descriptor', () => {
    const sortedMultiDescriptor = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`;
    const checksummedDescriptor = `${sortedMultiDescriptor}#${checksum(sortedMultiDescriptor)}`;
    expect(bytesToHex(compileWshDescriptor(checksummedDescriptor).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(sortedMultiDescriptor).scriptPubKey)
    );
  });

  it('compiles sortedmulti() with whitespace after separators like the library does for multi()', () => {
    const spaced = `wsh(sortedmulti( 2, ${xpubA}/0/0, ${xpubB}/0/0))`;
    const unspaced = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`;
    expect(bytesToHex(compileWshDescriptor(spaced).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(unspaced).scriptPubKey)
    );
  });

  it('derives the testnet network when a tpub follows a separator with whitespace', () => {
    const tpubA = makeNativeSegwitAccountTpub(1);
    const tpubB = makeNativeSegwitAccountTpub(2);
    const spaced = `wsh(multi(2, ${tpubA}/0/0, ${tpubB}/0/0))`;
    const unspaced = `wsh(multi(2,${tpubA}/0/0,${tpubB}/0/0))`;
    expect(bytesToHex(compileWshDescriptor(spaced).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(unspaced).scriptPubKey)
    );
  });

  it('derives every wildcard at the index when sorting sortedmulti() keys, like the library', () => {
    function pubkeyAtOneOne(seedByte: number) {
      return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte))
        .derive("m/84'/0'/0'")
        .deriveChild(1)
        .deriveChild(1).publicKey!;
    }
    const sortedPubkeys = [pubkeyAtOneOne(1), pubkeyAtOneOne(2)].sort((a, b) =>
      bytesToHex(a) < bytesToHex(b) ? -1 : 1
    );
    const expectedScript = btc.p2ms(2, sortedPubkeys).script;

    const { witnessScript } = compileWshDescriptor(
      `wsh(sortedmulti(2,${xpubA}/*/*,${xpubB}/*/*))`,
      1
    );
    expect(bytesToHex(witnessScript)).toBe(bytesToHex(expectedScript));
  });

  it('compiles a spaced sortedmulti() descriptor with testnet keys', () => {
    const tpubA = makeNativeSegwitAccountTpub(1);
    const tpubB = makeNativeSegwitAccountTpub(2);
    const spaced = `wsh(sortedmulti(2, ${tpubA}/0/0, ${tpubB}/0/0))`;
    const unspaced = `wsh(sortedmulti(2,${tpubA}/0/0,${tpubB}/0/0))`;
    expect(bytesToHex(compileWshDescriptor(spaced).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(unspaced).scriptPubKey)
    );
  });

  it('compiles a coordinator-style sortedmulti with origin-prefixed BIP-48 keys', () => {
    const xpubC = makeMultisigAccountXpub(1);
    const xpubD = makeMultisigAccountXpub(2);
    const coordinatorDescriptor = `wsh(sortedmulti(2,[aaaaaaaa/48'/0'/0'/2']${xpubC}/0/*,[bbbbbbbb/48'/0'/0'/2']${xpubD}/0/*))`;
    const bareDescriptor = `wsh(sortedmulti(2,${xpubC}/0/*,${xpubD}/0/*))`;

    expect(bytesToHex(compileWshDescriptor(coordinatorDescriptor).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(bareDescriptor).scriptPubKey)
    );
  });

  it('compiles origin-prefixed keys written with h hardened markers', () => {
    const xpubC = makeMultisigAccountXpub(1);
    const xpubD = makeMultisigAccountXpub(2);
    const hMarkerDescriptor = `wsh(sortedmulti(2,[aaaaaaaa/48h/0h/0h/2h]${xpubC}/0/*,[bbbbbbbb/48h/0h/0h/2h]${xpubD}/0/*))`;
    const apostropheDescriptor = `wsh(sortedmulti(2,[aaaaaaaa/48'/0'/0'/2']${xpubC}/0/*,[bbbbbbbb/48'/0'/0'/2']${xpubD}/0/*))`;

    expect(bytesToHex(compileWshDescriptor(hMarkerDescriptor).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(apostropheDescriptor).scriptPubKey)
    );
  });

  it('derives the testnet network from an origin-prefixed tpub', () => {
    const tpubC = makeMultisigAccountTpub(1);
    const tpubD = makeMultisigAccountTpub(2);
    const coordinatorDescriptor = `wsh(sortedmulti(2,[aaaaaaaa/48'/1'/0'/2']${tpubC}/0/*,[bbbbbbbb/48'/1'/0'/2']${tpubD}/0/*))`;
    const bareDescriptor = `wsh(sortedmulti(2,${tpubC}/0/*,${tpubD}/0/*))`;

    expect(bytesToHex(compileWshDescriptor(coordinatorDescriptor).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(bareDescriptor).scriptPubKey)
    );
  });

  it('compiles a 2-of-3 sortedmulti to the BIP67-sorted multi() witness script', () => {
    const sortedPubkeys = [
      makeNativeSegwitAddressPubkey(1),
      makeNativeSegwitAddressPubkey(2),
      makeNativeSegwitAddressPubkey(3),
    ].sort((a, b) => (bytesToHex(a) < bytesToHex(b) ? -1 : 1));
    const expectedScript = btc.p2ms(2, sortedPubkeys).script;

    const { witnessScript, keys } = compileWshDescriptor(
      `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0,${makeNativeSegwitAccountXpub(3)}/0/0))`
    );
    expect(bytesToHex(witnessScript)).toBe(bytesToHex(expectedScript));
    expect(keys.length).toBe(3);
    expect(findAccountKeyByPubkey(keys, pubkeyA)).toBeDefined();
  });

  it('compiles a mainnet descriptor whose xpub body contains a testnet-version prefix', () => {
    const mainnetXpubWithUprvInBody =
      'xpub6CaAQuPtBNMh2vA4pks4srT7Wikehzv3CV26taSskEmegu3RvvJFjvL6qQqqpEuprvKnJZvGyoqcdUnXQ9WSYgFhx2Gbhuibpr4EjUKEJWQ';
    expect(mainnetXpubWithUprvInBody).toContain('uprv');
    expect(() => compileWshDescriptor(`wsh(pk(${mainnetXpubWithUprvInBody}/0/*))`)).not.toThrow();
  });

  it('builds a Ledger key expression for an xpub key by adding the origin', () => {
    const { scriptPubKey, keys } = compileWshDescriptor(descriptor);
    const accountKey = findAccountKeyByPubkey(keys, pubkeyA)!;
    const keyOrigin = "e87a850b/84'/0'/0'";
    const ledgerDescriptor = toLedgerSignableDescriptor(descriptor, accountKey, xpubA, keyOrigin);

    expect(ledgerDescriptor).toContain(`[${keyOrigin}]${xpubA}`);
    // Origin is metadata only — the compiled scriptPubKey is unchanged.
    expect(bytesToHex(compileWshDescriptor(ledgerDescriptor).scriptPubKey)).toBe(
      bytesToHex(scriptPubKey)
    );
  });

  it('strips the stale checksum when rewriting a checksummed descriptor for Ledger', () => {
    const checksummedDescriptor = `${descriptor}#${checksum(descriptor)}`;
    const { scriptPubKey, keys } = compileWshDescriptor(checksummedDescriptor);
    const accountKey = findAccountKeyByPubkey(keys, pubkeyA)!;
    const keyOrigin = "e87a850b/84'/0'/0'";

    const ledgerDescriptor = toLedgerSignableDescriptor(
      checksummedDescriptor,
      accountKey,
      xpubA,
      keyOrigin
    );

    expect(ledgerDescriptor).toContain(`[${keyOrigin}]${xpubA}`);
    expect(ledgerDescriptor).not.toContain('#');
    expect(() => makeWshDescriptorInstance(ledgerDescriptor)).not.toThrow();
    expect(bytesToHex(compileWshDescriptor(ledgerDescriptor).scriptPubKey)).toBe(
      bytesToHex(scriptPubKey)
    );
  });

  it('builds a Ledger key expression for a raw pubkey by substituting the account xpub', () => {
    const rawPubkeyDescriptor = `wsh(and_v(v:after(5),pk(${bytesToHex(pubkeyA)})))`;
    const { scriptPubKey, keys } = compileWshDescriptor(rawPubkeyDescriptor);
    const accountKey = findAccountKeyByPubkey(keys, pubkeyA)!;
    expect(accountKey.bip32).toBeUndefined();

    const keyOrigin = "e87a850b/84'/0'/0'";
    const ledgerDescriptor = toLedgerSignableDescriptor(
      rawPubkeyDescriptor,
      accountKey,
      xpubA,
      keyOrigin
    );

    expect(ledgerDescriptor).toBe(`wsh(and_v(v:after(5),pk([${keyOrigin}]${xpubA}/0/0)))`);
    // Substituting the account's xpub/0/0 resolves to the same pubkey, so the
    // compiled scriptPubKey is unchanged.
    expect(bytesToHex(compileWshDescriptor(ledgerDescriptor).scriptPubKey)).toBe(
      bytesToHex(scriptPubKey)
    );
  });

  it('does not rewrite a key that already has an origin', () => {
    const keyOrigin = "e87a850b/84'/0'/0'";
    const { keys } = compileWshDescriptor(descriptor);
    const accountKey = findAccountKeyByPubkey(keys, pubkeyA)!;
    const ledgerDescriptor = toLedgerSignableDescriptor(descriptor, accountKey, xpubA, keyOrigin);

    const { keys: ledgerKeys } = compileWshDescriptor(ledgerDescriptor);
    const ledgerAccountKey = findAccountKeyByPubkey(ledgerKeys, pubkeyA)!;
    expect(toLedgerSignableDescriptor(ledgerDescriptor, ledgerAccountKey, xpubA, keyOrigin)).toBe(
      ledgerDescriptor
    );
  });

  it('rewrites every occurrence of a repeated xpub key on multiple branches', () => {
    const { keys } = compileWshDescriptor(`wsh(pk(${xpubA}/0/0))`);
    const accountKey = findAccountKeyByPubkey(keys, pubkeyA)!;
    const keyOrigin = "e87a850b/84'/0'/0'";
    // The same key on two branches (same sub-path).
    const repeated = `wsh(and_v(v:pk(${xpubA}/0/0),pk(${xpubA}/0/0)))`;

    const ledgerDescriptor = toLedgerSignableDescriptor(repeated, accountKey, xpubA, keyOrigin);
    expect(ledgerDescriptor.split(`[${keyOrigin}]${xpubA}`).length - 1).toBe(2);
  });

  it('rewrites every occurrence of a repeated raw-pubkey key on multiple branches', () => {
    const pubkeyHex = bytesToHex(pubkeyA);
    const { keys } = compileWshDescriptor(`wsh(pk(${pubkeyHex}))`);
    const accountKey = findAccountKeyByPubkey(keys, pubkeyA)!;
    expect(accountKey.bip32).toBeUndefined();
    const keyOrigin = "e87a850b/84'/0'/0'";
    const repeated = `wsh(and_v(v:pk(${pubkeyHex}),pk(${pubkeyHex})))`;

    const ledgerDescriptor = toLedgerSignableDescriptor(repeated, accountKey, xpubA, keyOrigin);
    expect(ledgerDescriptor.split(`[${keyOrigin}]${xpubA}/0/0`).length - 1).toBe(2);
    expect(ledgerDescriptor).not.toContain(pubkeyHex);
  });

  it('rewrites a testnet-versioned (tpub) account key by its descriptor location', () => {
    // Ledger uses tpub on testnet; the descriptor may carry a tpub even though the
    // wallet's stored xpub is mainnet-versioned. The rewrite must target the
    // descriptor's actual key string, not the passed xpub.
    const tpub = makeNativeSegwitAccountTpub(1);
    const tpubDescriptor = `wsh(pk(${tpub}/0/0))`;
    const { keys } = compileWshDescriptor(tpubDescriptor);
    const accountKey = keys[0];
    const keyOrigin = "e87a850b/84'/1'/0'";

    // xpubA (mainnet) stands in for the wallet's stored xpub — a different string.
    const ledgerDescriptor = toLedgerSignableDescriptor(
      tpubDescriptor,
      accountKey,
      xpubA,
      keyOrigin
    );
    expect(ledgerDescriptor).toContain(`[${keyOrigin}]${tpub}`);
    expect(ledgerDescriptor).not.toBe(tpubDescriptor);
  });

  it('throws when the account key cannot be located in the descriptor (no silent no-op)', () => {
    const { keys } = compileWshDescriptor(`wsh(pk(${xpubA}/0/0))`);
    const accountKey = findAccountKeyByPubkey(keys, pubkeyA)!;
    const keyOrigin = "e87a850b/84'/0'/0'";
    // Descriptor uses a different key (xpubB) than the matched accountKey (xpubA).
    expect(() =>
      toLedgerSignableDescriptor(`wsh(pk(${xpubB}/0/0))`, accountKey, xpubA, keyOrigin)
    ).toThrow();
  });
});

function deriveAddressIndexKey(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte))
    .derive("m/84'/0'/0'")
    .deriveChild(0)
    .deriveChild(0);
}

interface BuildPolicyTxOptions {
  signWith: number[];
  sha256?: [Uint8Array, Uint8Array][];
  lockTime?: number;
  sequence?: number;
  version?: number;
  foreignInput?: boolean;
}

function buildPolicyTx(descriptor: string, options: BuildPolicyTxOptions) {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  const tx = new btc.Transaction({
    allowUnknownInputs: true,
    lockTime: options.lockTime ?? 0,
    ...(options.version !== undefined ? { version: options.version } : {}),
  });
  tx.addInput({
    txid: hexToBytes('00'.repeat(32)),
    index: 0,
    sequence: options.sequence ?? 0xffffffff,
    witnessUtxo: { script: scriptPubKey, amount: 20_000n },
    witnessScript,
    ...(options.sha256 ? { sha256: options.sha256 } : {}),
  });
  if (options.foreignInput)
    tx.addInput({
      txid: hexToBytes('11'.repeat(32)),
      index: 0,
      sequence: 0xffffffff,
      witnessUtxo: {
        script: btc.p2wpkh(deriveAddressIndexKey(3).publicKey!).script,
        amount: 10_000n,
      },
    });
  tx.addOutput({ script: btc.p2wpkh(deriveAddressIndexKey(1).publicKey!).script, amount: 18_000n });
  for (const seed of options.signWith) tx.signIdx(deriveAddressIndexKey(seed).privateKey!, 0);
  return tx;
}

describe('isSignableWshDescriptor', () => {
  const pubkeyAHash160 = ripemd160(sha256(pubkeyA));

  it('rejects a pkh() descriptor that compiles to a p2wpkh scriptCode', () => {
    const pkhDescriptor = `wsh(pkh(${bytesToHex(pubkeyA)}))`;
    const { witnessScript } = compileWshDescriptor(pkhDescriptor);

    expect(bytesToHex(witnessScript)).toBe(`76a914${bytesToHex(pubkeyAHash160)}88ac`);
    expect(isSignableWshDescriptor(pkhDescriptor)).toBe(false);
  });

  it('rejects a ranged pkh() descriptor written with an extended key', () => {
    expect(isSignableWshDescriptor(`wsh(pkh(${xpubA}/0/*))`)).toBe(false);
    expect(isSignableWshDescriptor(`wsh(pkh(${xpubA}/1/3))`)).toBe(false);
  });

  it('rejects a checksummed pkh() descriptor', () => {
    const pkhDescriptor = `wsh(pkh(${bytesToHex(pubkeyA)}))`;
    expect(isSignableWshDescriptor(`${pkhDescriptor}#${checksum(pkhDescriptor)}`)).toBe(false);
  });

  it('rejects a descriptor that does not compile', () => {
    expect(isSignableWshDescriptor(`wsh(pk(${xpubA}))`)).toBe(false);
    expect(isSignableWshDescriptor(`wsh(multi(2,${xpubA}/2/0,${xpubB}/2/0))`)).toBe(false);
    expect(isSignableWshDescriptor('wsh(nonsense)')).toBe(false);
  });

  it('rejects a non-wsh descriptor', () => {
    expect(isSignableWshDescriptor(`wpkh(${xpubA}/0/*)`)).toBe(false);
  });

  it('allows the policy descriptors the wallet signs', () => {
    expect(isSignableWshDescriptor(descriptor)).toBe(true);
    expect(isSignableWshDescriptor(`wsh(pk(${xpubA}/0/*))`)).toBe(true);
    expect(isSignableWshDescriptor(`wsh(sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7))`)).toBe(true);
    expect(isSignableWshDescriptor(`wsh(and_v(v:after(5),pk(${bytesToHex(pubkeyA)})))`)).toBe(true);
  });

  it('allows a policy that merely contains a pkh() branch', () => {
    const policyWithPkhBranch = `wsh(and_v(v:pk(${xpubA}/0/0),pkh(${xpubB}/0/0)))`;
    const { witnessScript } = compileWshDescriptor(policyWithPkhBranch);

    expect(witnessScript.length).toBeGreaterThan(25);
    expect(isSignableWshDescriptor(policyWithPkhBranch)).toBe(true);
  });
});

function rewriteFirstPartialSig(
  psbtBytes: Uint8Array,
  rewrite: (signature: Uint8Array) => Uint8Array
) {
  const psbt = Psbt.fromBuffer(Buffer.from(psbtBytes));
  const partialSig = psbt.data.inputs[0].partialSig![0];
  partialSig.signature = rewrite(partialSig.signature);
  return psbt.toBuffer();
}

function getFinalizedRawTx(result: FinalizeWshDescriptorPsbtResult) {
  if (result.status !== 'finalized')
    throw new Error(`Expected a finalized psbt, got ${result.status}`);
  return result.rawTx;
}

const finalized = { status: 'finalized' };
const unsatisfied = { status: 'unsatisfied' };

describe('finalizeWshDescriptorPsbt', () => {
  const singleSig = `wsh(pk(${xpubA}/0/0))`;
  const multiSig = `wsh(multi(2,${xpubB}/0/0,${xpubA}/0/0))`;
  const preimageValue = new Uint8Array(32).fill(7);
  const preimageHash = sha256(preimageValue);
  const hashlock = `wsh(and_v(v:sha256(${bytesToHex(preimageHash)}),pk(${xpubA}/0/0)))`;
  const timelock = `wsh(and_v(v:or_i(after(1000),and_v(v:sha256(${digest}),pk(${xpubB}/0/0))),pk(${xpubA}/0/0)))`;

  it('finalizes a single-key policy and returns a broadcastable raw tx', () => {
    const psbt = buildPolicyTx(singleSig, { signWith: [1] }).toPSBT();
    const rawTx = getFinalizedRawTx(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: singleSig })
    );
    const decoded = btc.Transaction.fromRaw(hexToBytes(rawTx), { allowUnknownInputs: true });
    expect(decoded.inputsLength).toBe(1);
    expect(decoded.getInput(0).finalScriptWitness?.length).toBeGreaterThan(0);
  });

  it('finalizes the timelock branch with the account key alone', () => {
    const probe = makeWshDescriptorInstance(timelock, 0, {
      signersPubKeys: [Buffer.from(pubkeyA)],
    });
    const lockTime = probe.getLockTime() || 0;
    const sequence = probe.getSequence() ?? (lockTime !== 0 ? 0xfffffffe : 0xffffffff);
    const psbt = buildPolicyTx(timelock, { signWith: [1], lockTime, sequence }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: timelock })
    ).toMatchObject(finalized);
  });

  it('returns unsatisfied when a required co-signer signature is missing', () => {
    const psbt = buildPolicyTx(multiSig, { signWith: [1] }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: multiSig })
    ).toEqual(unsatisfied);
  });

  it('finalizes when every required signature is present', () => {
    const psbt = buildPolicyTx(multiSig, { signWith: [1, 2] }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: multiSig })
    ).toMatchObject(finalized);
  });

  it('returns unsatisfied when a merged co-signer signature is corrupted', () => {
    const psbt = rewriteFirstPartialSig(
      buildPolicyTx(multiSig, { signWith: [1, 2] }).toPSBT(),
      signature => {
        const corrupted = Uint8Array.from(signature);
        const sValueLastByte = corrupted.length - 2;
        corrupted[sValueLastByte] = corrupted[sValueLastByte] ^ 0xff;
        return corrupted;
      }
    );
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: multiSig })
    ).toEqual(unsatisfied);
  });

  it('returns unsatisfied when a merged co-signer signature declares a sighash it was not made for', () => {
    const psbt = rewriteFirstPartialSig(
      buildPolicyTx(multiSig, { signWith: [1, 2] }).toPSBT(),
      signature => {
        const relabelled = Uint8Array.from(signature);
        relabelled[relabelled.length - 1] = btc.SigHash.NONE;
        return relabelled;
      }
    );
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: multiSig })
    ).toEqual(unsatisfied);
  });

  it('returns unsatisfied when the timelock branch is planned but the tx locktime does not meet it', () => {
    const psbt = buildPolicyTx(timelock, { signWith: [1] }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: timelock })
    ).toEqual(unsatisfied);
  });

  it('returns unsatisfied when the timelock is met but the input sequence is final', () => {
    const probe = makeWshDescriptorInstance(timelock, 0, {
      signersPubKeys: [Buffer.from(pubkeyA)],
    });
    const lockTime = probe.getLockTime() || 0;
    const psbt = buildPolicyTx(timelock, {
      signWith: [1],
      lockTime,
      sequence: 0xffffffff,
    }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: timelock })
    ).toEqual(unsatisfied);
  });

  it('finalizes the timelock branch with an RBF-signalling sequence', () => {
    const probe = makeWshDescriptorInstance(timelock, 0, {
      signersPubKeys: [Buffer.from(pubkeyA)],
    });
    const lockTime = probe.getLockTime() || 0;
    const psbt = buildPolicyTx(timelock, {
      signWith: [1],
      lockTime,
      sequence: 0xfffffffd,
    }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: timelock })
    ).toMatchObject(finalized);
  });

  it('finalizes the timelock branch when the tx locktime exceeds the required height', () => {
    const psbt = buildPolicyTx(timelock, {
      signWith: [1],
      lockTime: 1500,
      sequence: 0xfffffffe,
    }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: timelock })
    ).toMatchObject(finalized);
  });

  it('returns unsatisfied when a time-based locktime is set for a height-based lock', () => {
    const psbt = buildPolicyTx(timelock, {
      signWith: [1],
      lockTime: 600_000_000,
      sequence: 0xfffffffe,
    }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: timelock })
    ).toEqual(unsatisfied);
  });

  describe('relative timelock', () => {
    const relativeTimelock = `wsh(and_v(v:older(144),pk(${xpubA}/0/0)))`;
    const timeTypedSequence = 0x00400000 | 144;
    const disabledSequence = 0x80000000 + 144;

    function finalizeWithSequence(sequence: number, version?: number) {
      const psbt = buildPolicyTx(relativeTimelock, { signWith: [1], sequence, version }).toPSBT();
      return finalizeWshDescriptorPsbt({
        signedPsbt: psbt,
        preimagePsbt: psbt,
        descriptor: relativeTimelock,
      });
    }

    it('finalizes with the exact required sequence', () => {
      expect(finalizeWithSequence(144)).toMatchObject(finalized);
    });

    it('finalizes when the input sequence exceeds the required blocks', () => {
      expect(finalizeWithSequence(200)).toMatchObject(finalized);
    });

    it('returns unsatisfied when the input sequence is below the required blocks', () => {
      expect(finalizeWithSequence(100)).toEqual(unsatisfied);
    });

    it('returns unsatisfied when the input sequence is time-based for a block-based lock', () => {
      expect(finalizeWithSequence(timeTypedSequence)).toEqual(unsatisfied);
    });

    it('returns unsatisfied when the input sequence has the disable flag set', () => {
      expect(finalizeWithSequence(disabledSequence)).toEqual(unsatisfied);
    });

    it('returns unsatisfied when the tx version predates BIP-68', () => {
      expect(finalizeWithSequence(144, 1)).toEqual(unsatisfied);
    });
  });

  it('finalizes a 2-of-3 sortedmulti once any two signatures are present', () => {
    const twoOfThree = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0,${makeNativeSegwitAccountXpub(3)}/0/0))`;
    const psbt = buildPolicyTx(twoOfThree, { signWith: [2, 3] }).toPSBT();
    const rawTx = getFinalizedRawTx(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: twoOfThree })
    );
    const decoded = btc.Transaction.fromRaw(hexToBytes(rawTx), { allowUnknownInputs: true });
    expect(decoded.getInput(0).finalScriptWitness?.length).toBeGreaterThan(0);
  });

  it('returns unsatisfied for a 2-of-3 sortedmulti with only one signature', () => {
    const twoOfThree = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0,${makeNativeSegwitAccountXpub(3)}/0/0))`;
    const psbt = buildPolicyTx(twoOfThree, { signWith: [1] }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: twoOfThree })
    ).toEqual(unsatisfied);
  });

  it('finalizes a coordinator-style origin-prefixed sortedmulti psbt', () => {
    const coordinatorDescriptor = `wsh(sortedmulti(2,[aaaaaaaa/84'/0'/0']${xpubA}/0/*,[bbbbbbbb/84'/0'/0']${xpubB}/0/*))`;
    const psbt = buildPolicyTx(coordinatorDescriptor, { signWith: [1, 2] }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({
        signedPsbt: psbt,
        preimagePsbt: psbt,
        descriptor: coordinatorDescriptor,
      })
    ).toMatchObject(finalized);
  });

  it('finalizes a sortedmulti policy when every required signature is present', () => {
    const sortedMultiSig = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`;
    const psbt = buildPolicyTx(sortedMultiSig, { signWith: [1, 2] }).toPSBT();
    const rawTx = getFinalizedRawTx(
      finalizeWshDescriptorPsbt({
        signedPsbt: psbt,
        preimagePsbt: psbt,
        descriptor: sortedMultiSig,
      })
    );
    const decoded = btc.Transaction.fromRaw(hexToBytes(rawTx), { allowUnknownInputs: true });
    expect(decoded.getInput(0).finalScriptWitness?.length).toBeGreaterThan(0);
  });

  it('finalizes a hashlock branch when the preimage is supplied in the psbt', () => {
    const psbt = buildPolicyTx(hashlock, {
      signWith: [1],
      sha256: [[preimageHash, preimageValue]],
    }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: hashlock })
    ).toMatchObject(finalized);
  });

  it('returns unsatisfied when a required preimage is missing', () => {
    const psbt = buildPolicyTx(hashlock, { signWith: [1] }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: hashlock })
    ).toEqual(unsatisfied);
  });

  it('relays a preimage from the original psbt when the signed psbt dropped it', () => {
    const signedPsbt = buildPolicyTx(hashlock, { signWith: [1] }).toPSBT();
    const preimagePsbt = buildPolicyTx(hashlock, {
      signWith: [],
      sha256: [[preimageHash, preimageValue]],
    }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt, preimagePsbt, descriptor: hashlock })
    ).toMatchObject(finalized);
  });

  it('returns unsatisfied when a non-descriptor input cannot be finalized', () => {
    const psbt = buildPolicyTx(singleSig, { signWith: [1], foreignInput: true }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: singleSig })
    ).toEqual(unsatisfied);
  });

  it('returns unsatisfied when no psbt input is locked by the descriptor', () => {
    const tx = new btc.Transaction();
    tx.addInput({
      txid: hexToBytes('22'.repeat(32)),
      index: 0,
      witnessUtxo: { script: btc.p2wpkh(pubkeyA).script, amount: 20_000n },
    });
    tx.addOutput({ script: btc.p2wpkh(pubkeyA).script, amount: 18_000n });
    const psbt = tx.toPSBT();
    expect(
      finalizeWshDescriptorPsbt({ signedPsbt: psbt, preimagePsbt: psbt, descriptor: singleSig })
    ).toEqual(unsatisfied);
  });

  it('returns unsatisfied when the signed psbt is missing the input index the preimage psbt matched', () => {
    const { scriptPubKey, witnessScript } = compileWshDescriptor(singleSig);
    const preimageTx = new btc.Transaction({ allowUnknownInputs: true });
    preimageTx.addInput({
      txid: hexToBytes('11'.repeat(32)),
      index: 0,
      witnessUtxo: {
        script: btc.p2wpkh(deriveAddressIndexKey(3).publicKey!).script,
        amount: 10_000n,
      },
    });
    preimageTx.addInput({
      txid: hexToBytes('00'.repeat(32)),
      index: 0,
      witnessUtxo: { script: scriptPubKey, amount: 20_000n },
      witnessScript,
    });
    preimageTx.addOutput({ script: btc.p2wpkh(pubkeyA).script, amount: 18_000n });

    // The signed psbt has a single input, so the matched index (1) is missing.
    const signedPsbt = buildPolicyTx(singleSig, { signWith: [1] }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({
        signedPsbt,
        preimagePsbt: preimageTx.toPSBT(),
        descriptor: singleSig,
      })
    ).toEqual(unsatisfied);
  });

  it('returns unsatisfied when the signed psbt input at the matched index is not locked by the descriptor', () => {
    const accountKey = deriveAddressIndexKey(1);
    const signedTx = new btc.Transaction();
    signedTx.addInput({
      txid: hexToBytes('00'.repeat(32)),
      index: 0,
      witnessUtxo: { script: btc.p2wpkh(accountKey.publicKey!).script, amount: 20_000n },
    });
    signedTx.addOutput({ script: btc.p2wpkh(pubkeyA).script, amount: 18_000n });
    signedTx.signIdx(accountKey.privateKey!, 0);

    const preimagePsbt = buildPolicyTx(singleSig, { signWith: [] }).toPSBT();
    expect(
      finalizeWshDescriptorPsbt({
        signedPsbt: signedTx.toPSBT(),
        preimagePsbt,
        descriptor: singleSig,
      })
    ).toEqual(unsatisfied);
  });

  it('returns unsatisfied for malformed psbt bytes', () => {
    const malformed = new Uint8Array([1, 2, 3]);
    expect(
      finalizeWshDescriptorPsbt({
        signedPsbt: malformed,
        preimagePsbt: malformed,
        descriptor: singleSig,
      })
    ).toEqual(unsatisfied);
  });
});

describe('extractWshDescriptorPreimages', () => {
  it('maps supplied hash preimages into the satisfier digest format', () => {
    const sha256Value = new Uint8Array(32).fill(7);
    const sha256H = sha256(sha256Value);
    const hash256Value = new Uint8Array(32).fill(8);
    const hash256H = sha256(sha256(hash256Value));

    const tx = new btc.Transaction({ allowUnknownInputs: true });
    tx.addInput({
      txid: hexToBytes('00'.repeat(32)),
      index: 0,
      witnessUtxo: { script: btc.p2wpkh(pubkeyA).script, amount: 10_000n },
      sha256: [[sha256H, sha256Value]],
      hash256: [[hash256H, hash256Value]],
    });

    const preimages = extractWshDescriptorPreimages(tx, [0]);
    expect(preimages).toContainEqual({
      digest: `sha256(${bytesToHex(sha256H)})`,
      preimage: bytesToHex(sha256Value),
    });
    expect(preimages).toContainEqual({
      digest: `hash256(${bytesToHex(hash256H)})`,
      preimage: bytesToHex(hash256Value),
    });
  });

  it('maps ripemd160 and hash160 preimages into the satisfier digest format', () => {
    const ripemd160Value = new Uint8Array(32).fill(9);
    const ripemd160H = ripemd160(ripemd160Value);
    const hash160Value = new Uint8Array(32).fill(10);
    const hash160H = ripemd160(sha256(hash160Value));

    const tx = new btc.Transaction({ allowUnknownInputs: true });
    tx.addInput({
      txid: hexToBytes('00'.repeat(32)),
      index: 0,
      witnessUtxo: { script: btc.p2wpkh(pubkeyA).script, amount: 10_000n },
      ripemd160: [[ripemd160H, ripemd160Value]],
      hash160: [[hash160H, hash160Value]],
    });

    const preimages = extractWshDescriptorPreimages(tx, [0]);
    expect(preimages).toContainEqual({
      digest: `ripemd160(${bytesToHex(ripemd160H)})`,
      preimage: bytesToHex(ripemd160Value),
    });
    expect(preimages).toContainEqual({
      digest: `hash160(${bytesToHex(hash160H)})`,
      preimage: bytesToHex(hash160Value),
    });
  });

  it('returns an empty list when no preimages are present', () => {
    const tx = new btc.Transaction({ allowUnknownInputs: true });
    tx.addInput({
      txid: hexToBytes('00'.repeat(32)),
      index: 0,
      witnessUtxo: { script: btc.p2wpkh(pubkeyA).script, amount: 10_000n },
    });
    expect(extractWshDescriptorPreimages(tx, [0])).toEqual([]);
  });

  it('reads the threshold from a sortedmulti descriptor', () => {
    expect(getWshDescriptorThreshold(`wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`)).toBe(2);
  });

  it('reads the threshold from a multi descriptor', () => {
    expect(getWshDescriptorThreshold(`wsh(multi(1,${xpubA}/0/0,${xpubB}/0/0))`)).toBe(1);
  });
});

describe('isExtendedPublicKeyExpression', () => {
  it('accepts xpub and tpub key expressions with paths, origins, and wildcards', () => {
    const xpub = makeNativeSegwitAccountXpub(1);
    const tpub = makeNativeSegwitAccountTpub(1);
    expect(isExtendedPublicKeyExpression(xpub)).toBe(true);
    expect(isExtendedPublicKeyExpression(`${xpub}/0/7`)).toBe(true);
    expect(isExtendedPublicKeyExpression(`${xpub}/0/*`)).toBe(true);
    expect(isExtendedPublicKeyExpression(`[aabbccdd/48'/0'/0'/2']${xpub}/0/7`)).toBe(true);
    expect(isExtendedPublicKeyExpression(`${tpub}/0/7`)).toBe(true);
  });

  it('rejects raw pubkeys, private keys, and malformed expressions', () => {
    const rawPubkeyHex = bytesToHex(makeNativeSegwitAddressPubkey(1));
    const xprv = HDKey.fromMasterSeed(new Uint8Array(32).fill(1)).derive(
      "m/84'/0'/0'"
    ).privateExtendedKey;
    expect(isExtendedPublicKeyExpression(rawPubkeyHex)).toBe(false);
    expect(isExtendedPublicKeyExpression(`${xprv}/0/7`)).toBe(false);
    expect(isExtendedPublicKeyExpression('not-a-key')).toBe(false);
    expect(isExtendedPublicKeyExpression('')).toBe(false);
  });
});

describe('getWshDescriptorThreshold', () => {
  it('reads the maximum OP_16 threshold from a 16-of-16 multisig', () => {
    const keys = Array.from({ length: 16 }, (_, i) => `${makeNativeSegwitAccountXpub(i + 1)}/0/0`);
    expect(getWshDescriptorThreshold(`wsh(multi(16,${keys.join(',')}))`)).toBe(16);
  });

  it('throws for a single-key descriptor whose script starts with a key push, not a threshold', () => {
    expect(() => getWshDescriptorThreshold(`wsh(pk(${xpubA}/0/0))`)).toThrow(
      'does not start with a multisig threshold opcode'
    );
  });

  it('throws for a miniscript policy whose witness script is not a bare multisig', () => {
    expect(() => getWshDescriptorThreshold(descriptor)).toThrow(
      'does not start with a multisig threshold opcode'
    );
  });
});
