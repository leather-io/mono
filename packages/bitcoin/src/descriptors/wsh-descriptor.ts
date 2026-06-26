import {
  type DescriptorInstance,
  DescriptorsFactory,
  type KeyInfo,
} from '@bitcoinerlab/descriptors';
import secp256k1 from '@bitcoinerlab/secp256k1';
import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { type Network, Psbt, networks } from 'bitcoinjs-lib';

import { type BitcoinNetworkModes, type NetworkModes } from '@leather.io/models';

import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';
import { deriveAddressIndexKeychainFromAccount } from '../utils/bitcoin.utils';

const { Descriptor, parseKeyExpression } = DescriptorsFactory(secp256k1);

const wshDescriptorPrefix = 'wsh(';

export function isWshDescriptor(descriptor: string) {
  return descriptor.trimStart().startsWith(wshDescriptorPrefix);
}

const testnetExtendedKeyPrefixes = ['tpub', 'tprv', 'upub', 'uprv', 'vpub', 'vprv'];
const mainnetExtendedKeyPrefixes = ['xpub', 'xprv', 'ypub', 'yprv', 'zpub', 'zprv'];
const keyExpressionStarts = ['(', ',', ']'];

function descriptorHasKeyPrefix(descriptor: string, prefixes: string[]) {
  const compactDescriptor = descriptor.replace(/\s/g, '');
  return keyExpressionStarts.some(start =>
    prefixes.some(prefix => compactDescriptor.includes(start + prefix))
  );
}

export function getWshDescriptorNetwork(descriptor: string): NetworkModes | undefined {
  if (descriptorHasKeyPrefix(descriptor, testnetExtendedKeyPrefixes)) return 'testnet';
  if (descriptorHasKeyPrefix(descriptor, mainnetExtendedKeyPrefixes)) return 'mainnet';
  return undefined;
}

// A P2WSH witness script and its scriptPubKey are network-independent — the same
// keys and policy compile to identical bytes on mainnet and testnet. This
// parsing network only governs extended-key version-byte validation. Callers
// that need a bech32 address should pass an explicit network to
// getWshDescriptorAddress instead of treating this fallback as policy identity.
function getNetworkForDescriptor(descriptor: string): Network {
  return getWshDescriptorNetwork(descriptor) === 'testnet' ? networks.testnet : networks.bitcoin;
}

function deriveKeyExpressionPubkeyHex(keyExpression: string, network: Network, index: number) {
  const { pubkey } = parseKeyExpression({
    keyExpression: keyExpression.replaceAll('*', String(index)),
    network,
    isSegwit: true,
  });
  if (!pubkey)
    throw new Error(`Could not derive a public key from key expression ${keyExpression}`);
  return bytesToHex(pubkey);
}

function rewriteSortedmultiAsMulti(descriptor: string, index: number) {
  if (!descriptor.includes('sortedmulti(')) return descriptor;

  const network = getNetworkForDescriptor(descriptor);
  return stripDescriptorChecksum(descriptor).replace(
    /sortedmulti\(([^()]*)\)/g,
    (match, args: string) => {
      const [threshold, ...keyExpressions] = args.split(',').map(part => part.trim());
      const sortedKeyExpressions = keyExpressions
        .map(keyExpression => ({
          keyExpression,
          pubkeyHex: deriveKeyExpressionPubkeyHex(keyExpression, network, index),
        }))
        .sort((a, b) => (a.pubkeyHex < b.pubkeyHex ? -1 : 1))
        .map(({ keyExpression }) => keyExpression);
      return `multi(${[threshold, ...sortedKeyExpressions].join(',')})`;
    }
  );
}

export interface DescriptorKeyPathIndexes {
  changeIndex: number;
  addressIndex: number;
}

const allowedDescriptorKeyPathPattern = /^\/[01]\/\d+$/;

function getUniformKeyPathIndexes(keys: KeyInfo[]): DescriptorKeyPathIndexes {
  const keyPaths = keys.filter(key => key.bip32).map(key => key.keyPath);
  if (!keyPaths.length) return { changeIndex: 0, addressIndex: 0 };

  const [keyPath, ...remainingKeyPaths] = keyPaths;
  if (remainingKeyPaths.some(path => path !== keyPath))
    throw new Error('All extended keys in the descriptor must use the same key path');

  if (!keyPath || !allowedDescriptorKeyPathPattern.test(keyPath))
    throw new Error('Extended keys in the descriptor must use a key path of the form /0/N or /1/N');

  const [, changeIndex, addressIndex] = keyPath.split('/');
  return { changeIndex: Number(changeIndex), addressIndex: Number(addressIndex) };
}

export interface CompiledWshDescriptor {
  scriptPubKey: Uint8Array;
  witnessScript: Uint8Array;
  keys: KeyInfo[];
  keyPathIndexes: DescriptorKeyPathIndexes;
}

// Builds the @bitcoinerlab Descriptor instance for a `wsh(...)` descriptor. The
// library requires an `index` only for ranged descriptors (those with a `*`
// wildcard) and rejects it for fixed-path ones. The network is derived from the
// descriptor's own key prefix (see getNetworkForDescriptor).
export interface WshDescriptorPreimage {
  digest: string;
  preimage: string;
}

interface MakeWshDescriptorInstanceOptions {
  preimages?: WshDescriptorPreimage[];
  signersPubKeys?: Buffer[];
}

export function makeWshDescriptorInstance(
  descriptor: string,
  index = 0,
  options: MakeWshDescriptorInstanceOptions = {}
): DescriptorInstance {
  if (!isWshDescriptor(descriptor))
    throw new Error('Only wsh() descriptors are supported for descriptor signing');

  const compilableDescriptor = rewriteSortedmultiAsMulti(descriptor, index);
  const network = getNetworkForDescriptor(compilableDescriptor);
  const isRanged = compilableDescriptor.includes('*');
  const { preimages, signersPubKeys } = options;
  return new Descriptor({
    expression: compilableDescriptor,
    network,
    ...(isRanged ? { index } : {}),
    ...(preimages ? { preimages } : {}),
    ...(signersPubKeys ? { signersPubKeys } : {}),
  });
}

// Compiles a `wsh(...)` BIP-380 descriptor into its scriptPubKey and witness
// script, and returns the key expressions it contains. The witness script is a
// deterministic function of the descriptor, so the scriptPubKey it produces can
// be matched against a PSBT input's `witnessUtxo` to confirm the input is locked
// by this descriptor.
export function compileWshDescriptor(descriptor: string, index = 0): CompiledWshDescriptor {
  const instance = makeWshDescriptorInstance(descriptor, index);

  const witnessScript = instance.getWitnessScript();
  if (!witnessScript) throw new Error('Descriptor does not produce a witness script');

  const { expansionMap } = instance.expand();
  const keys = expansionMap ? Object.values(expansionMap) : [];

  return {
    scriptPubKey: Uint8Array.from(instance.getScriptPubKey()),
    witnessScript: Uint8Array.from(witnessScript),
    keys,
    keyPathIndexes: getUniformKeyPathIndexes(keys),
  };
}

const opPushNumberOne = 0x50;
const maxMultisigOpcode = 0x60;

export function getWshDescriptorThreshold(descriptor: string, index = 0): number {
  const { witnessScript } = compileWshDescriptor(descriptor, index);
  const opcode = witnessScript[0];
  if (opcode === undefined || opcode <= opPushNumberOne || opcode > maxMultisigOpcode)
    throw new Error('Descriptor witness script does not start with a multisig threshold opcode');
  return opcode - opPushNumberOne;
}

// Derives the P2WSH (bech32) receive address a `wsh(...)` descriptor locks to.
// Pass `networkMode` when policy/network identity is known. If omitted, the
// address network is inferred from the descriptor's key prefixes for backwards
// compatibility with existing callers.
export function getWshDescriptorAddress(
  descriptor: string,
  networkMode?: BitcoinNetworkModes
): string {
  if (networkMode) {
    const { scriptPubKey } = compileWshDescriptor(descriptor);
    return btc
      .Address(getBtcSignerLibNetworkConfigByMode(networkMode))
      .encode(btc.OutScript.decode(scriptPubKey));
  }

  const address = makeWshDescriptorInstance(descriptor).getAddress();
  if (!address) throw new Error('Descriptor does not produce an address');
  return address;
}

// Finds the descriptor key whose concrete public key equals the given pubkey.
// Matching on the resolved pubkey (rather than the xpub string) works for both
// xpub key expressions (resolved at the descriptor's index) and raw-pubkey key
// expressions, and confirms the current account participates in the descriptor
// at the address index it was derived for.
export function findAccountKeyByPubkey(keys: KeyInfo[], pubkey: Uint8Array) {
  const pubkeyHex = bytesToHex(pubkey);
  return keys.find(
    (key): key is KeyInfo & { pubkey: Buffer } =>
      !!key.pubkey && bytesToHex(key.pubkey) === pubkeyHex
  );
}

export interface AccountDescriptorKey extends DescriptorKeyPathIndexes {
  key: KeyInfo & { pubkey: Buffer };
}

export function findAccountDescriptorKey(
  compiled: CompiledWshDescriptor,
  accountKeychain: HDKey
): AccountDescriptorKey | undefined {
  const { keys, keyPathIndexes } = compiled;

  if (accountKeychain.publicKey) {
    const accountPubkeyHex = bytesToHex(accountKeychain.publicKey);
    const addressIndexKeychain =
      deriveAddressIndexKeychainFromAccount(accountKeychain)(keyPathIndexes);
    const addressIndexPubkeyHex = addressIndexKeychain.publicKey
      ? bytesToHex(addressIndexKeychain.publicKey)
      : undefined;
    const extendedKey = keys.find(
      (key): key is KeyInfo & { pubkey: Buffer } =>
        !!key.pubkey &&
        !!key.bip32 &&
        bytesToHex(key.bip32.publicKey) === accountPubkeyHex &&
        bytesToHex(key.pubkey) === addressIndexPubkeyHex
    );
    if (extendedKey) return { key: extendedKey, ...keyPathIndexes };
  }

  const addressIndexZeroKeychain = deriveAddressIndexKeychainFromAccount(accountKeychain)({
    changeIndex: 0,
    addressIndex: 0,
  });
  if (!addressIndexZeroKeychain.publicKey) return undefined;

  const rawPubkeyKey = findAccountKeyByPubkey(keys, addressIndexZeroKeychain.publicKey);
  if (rawPubkeyKey) return { key: rawPubkeyKey, changeIndex: 0, addressIndex: 0 };

  return undefined;
}

function stripDescriptorChecksum(descriptor: string): string {
  const separatorIndex = descriptor.indexOf('#');
  return separatorIndex === -1 ? descriptor : descriptor.slice(0, separatorIndex);
}

// Rewrites the account's key in the descriptor into a Ledger-signable key
// expression. Ledger can only sign through a wallet policy whose keys are
// `[fingerprint/path]xpub` (it derives + matches by origin), so:
// - a bare xpub key gains the account's origin prefix;
// - a raw-pubkey key (always the account's 0/0 address) is replaced by the
//   account's `[origin]xpub/0/0`, which resolves to the same pubkey.
// Every occurrence is rewritten — the same key can appear on multiple miniscript
// branches. The compiled scriptPubKey/witness script are unchanged. No-op if the
// matched key already carries an origin. Note: bitcoinerlab/Ledger still reject
// the same key used with different sub-paths (e.g. `/0/*` and `/1/*`).
export function toLedgerSignableDescriptor(
  descriptor: string,
  accountKey: KeyInfo,
  accountXpub: string,
  keyOrigin: string
) {
  if (accountKey.masterFingerprint) return descriptor;

  // The key as written in the descriptor — its own serialization (xpub, tpub, a
  // SLIP-132 variant, or a raw pubkey), which may differ from the wallet's stored
  // mainnet-version xpub. We must rewrite THIS string, not `accountXpub`.
  const accountKeyString = accountKey.keyExpression.split('/')[0];
  const descriptorWithoutChecksum = stripDescriptorChecksum(descriptor);

  const ledgerDescriptor = accountKey.bip32
    ? descriptorWithoutChecksum.replaceAll(accountKeyString, `[${keyOrigin}]${accountKeyString}`)
    : descriptorWithoutChecksum.replaceAll(accountKeyString, `[${keyOrigin}]${accountXpub}/0/0`);

  // A no-op means we couldn't locate the account key — fail loudly rather than
  // hand Ledger an unmodified descriptor it cannot sign.
  if (ledgerDescriptor === descriptorWithoutChecksum)
    throw new Error('Could not locate the account key in the descriptor for Ledger signing');

  return ledgerDescriptor;
}

// Returns the indexes of every PSBT input whose `witnessUtxo` is locked by the
// given scriptPubKey. Because the scriptPubKey commits to the witness script
// (`OP_0 <sha256(witnessScript)>`), a match guarantees the input is spendable by
// the compiled descriptor.
export function getDescriptorMatchingInputIndexes(
  tx: btc.Transaction,
  scriptPubKey: Uint8Array
): number[] {
  const scriptPubKeyHex = bytesToHex(scriptPubKey);
  const indexes: number[] = [];
  for (let index = 0; index < tx.inputsLength; index++) {
    const script = tx.getInput(index).witnessUtxo?.script;
    if (script && bytesToHex(script) === scriptPubKeyHex) indexes.push(index);
  }
  return indexes;
}

const descriptorAllowedSighashTypes: number[] = [btc.SigHash.DEFAULT, btc.SigHash.ALL];

export function getDescriptorInputsWithDisallowedSighash(
  tx: btc.Transaction,
  inputIndexes: number[]
): number[] {
  return inputIndexes.filter(index => {
    const { sighashType } = tx.getInput(index);
    return sighashType !== undefined && !descriptorAllowedSighashTypes.includes(sighashType);
  });
}

const wshPreimageDigestFns = ['sha256', 'hash256', 'ripemd160', 'hash160'] as const;

// Reads the hash preimages a coordinator supplied on the given inputs (standard
// BIP-174 fields, preserved by @scure/btc-signer but dropped by bitcoinjs-lib's
// bip174) and maps them to the `{ digest, preimage }` form the bitcoinerlab
// miniscript satisfier consumes. Leather never generates a preimage — it only
// relays what the PSBT already carries so a hashlock branch can be finalized.
export function extractWshDescriptorPreimages(
  tx: btc.Transaction,
  inputIndexes: number[]
): WshDescriptorPreimage[] {
  const preimages: WshDescriptorPreimage[] = [];
  for (const index of inputIndexes) {
    const input = tx.getInput(index);
    const entriesByFn = {
      sha256: input.sha256,
      hash256: input.hash256,
      ripemd160: input.ripemd160,
      hash160: input.hash160,
    };
    for (const fn of wshPreimageDigestFns) {
      for (const [hash, preimage] of entriesByFn[fn] ?? []) {
        preimages.push({ digest: `${fn}(${bytesToHex(hash)})`, preimage: bytesToHex(preimage) });
      }
    }
  }
  return preimages;
}

export interface FinalizeWshDescriptorPsbtArgs {
  signedPsbt: Uint8Array;
  preimagePsbt: Uint8Array;
  descriptor: string;
}

// Attempts to finalize the descriptor-locked inputs of an already-signed PSBT
// and return the raw transaction hex, ready to broadcast. Finalization satisfies
// the miniscript from the signatures present on each input (Leather's plus any
// co-signer signatures the coordinator merged in) and the relayed preimages,
// respecting the tx's locktime/sequence. Signatures come from the signed PSBT;
// preimages are read from `preimagePsbt` (the original coordinator PSBT, whose
// preimage fields survive even when the signer round-tripped through
// bitcoinjs-lib). Returns null when the policy cannot be fully satisfied or any
// input is left unfinalized, so the caller can fall back to returning the
// partially-signed PSBT for a coordinator to complete.
export function finalizeWshDescriptorPsbt({
  signedPsbt,
  preimagePsbt,
  descriptor,
}: FinalizeWshDescriptorPsbtArgs): string | null {
  try {
    const { scriptPubKey } = compileWshDescriptor(descriptor);

    const preimageTx = btc.Transaction.fromPSBT(preimagePsbt);
    const inputIndexes = getDescriptorMatchingInputIndexes(preimageTx, scriptPubKey);
    if (!inputIndexes.length) return null;

    const preimages = extractWshDescriptorPreimages(preimageTx, inputIndexes);
    const psbt = Psbt.fromBuffer(Buffer.from(signedPsbt), {
      network: getNetworkForDescriptor(descriptor),
    });

    for (const index of inputIndexes) {
      const input = psbt.data.inputs[index];
      if (!input) return null;

      const signersPubKeys = input.partialSig?.map(sig => sig.pubkey);
      const instance = makeWshDescriptorInstance(descriptor, 0, {
        preimages,
        signersPubKeys: signersPubKeys?.length ? signersPubKeys : undefined,
      });

      // bitcoinerlab finalization compares the input's witness script to the
      // descriptor's by reference, not content. Our witness script survived a
      // PSBT round-trip, so it is a different Buffer instance with identical
      // bytes (the input was matched by its scriptPubKey, which commits to it).
      // Re-attach the instance's own witness script so the reference check
      // passes.
      input.witnessScript = instance.getWitnessScript();
      instance.finalizePsbtInput({ index, psbt });
    }

    return psbt.extractTransaction(true).toHex();
  } catch {
    return null;
  }
}
