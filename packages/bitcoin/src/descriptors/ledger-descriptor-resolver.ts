import { type KeyInfo } from '@bitcoinerlab/descriptors';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { createBase58check } from '@scure/base';
import { HARDENED_OFFSET, type HDKey } from '@scure/bip32';
import { Psbt } from 'bitcoinjs-lib';

import { deriveKeychainFromXpub } from '@leather.io/crypto';

import {
  type AccountDescriptorKey,
  type CompiledWshDescriptor,
  compileWshDescriptor,
  stripDescriptorChecksum,
} from './wsh-descriptor';

const masterPath = 'm';
const hardenedMarker = "'";
const base58check = createBase58check(sha256);

type GlobalXpub = NonNullable<Psbt['data']['globalMap']['globalXpub']>[number];
type Bip32Derivation = NonNullable<Psbt['data']['inputs'][number]['bip32Derivation']>[number];
type RawPublicKey = KeyInfo & { pubkey: Uint8Array };

export type LedgerDescriptorResolutionErrorReason =
  | 'ambiguous-global-xpub'
  | 'incompatible-global-xpub'
  | 'inconsistent-input-derivation'
  | 'missing-global-xpub'
  | 'missing-input-derivation';

export interface LedgerDescriptorResolutionSuccess {
  status: 'success';
  descriptor: string;
}

export interface LedgerDescriptorResolutionError {
  status: 'error';
  reason: LedgerDescriptorResolutionErrorReason;
  publicKey: string;
}

export type LedgerDescriptorResolution =
  | LedgerDescriptorResolutionSuccess
  | LedgerDescriptorResolutionError;

export interface ResolveLedgerSignableDescriptorArgs {
  descriptor: string;
  psbt: Uint8Array;
  inputIndexes: number[];
  accountKey: AccountDescriptorKey['key'];
}

type InputDerivationResult =
  | { status: 'success'; derivation: Bip32Derivation }
  | { status: 'error'; reason: 'inconsistent-input-derivation' | 'missing-input-derivation' };

function resolutionError(
  reason: LedgerDescriptorResolutionErrorReason,
  publicKey: string
): LedgerDescriptorResolutionError {
  return { status: 'error', reason, publicKey };
}

function getForeignRawPublicKeys(keys: KeyInfo[], accountKey: RawPublicKey): RawPublicKey[] {
  const accountPublicKey = bytesToHex(accountKey.pubkey);
  const uniqueKeys = new Map(keys.map(key => [key.keyExpression, key])).values();
  return Array.from(uniqueKeys).filter(
    (key): key is RawPublicKey =>
      !key.bip32 && !!key.pubkey && bytesToHex(key.pubkey) !== accountPublicKey
  );
}

function getInputDerivation(
  psbt: Psbt,
  inputIndexes: number[],
  publicKey: string
): InputDerivationResult {
  const derivations = inputIndexes.flatMap(
    index =>
      psbt.data.inputs[index]?.bip32Derivation?.find(
        derivation => bytesToHex(derivation.pubkey) === publicKey
      ) ?? []
  );
  const [derivation, ...remainingDerivations] = derivations;
  if (!derivation || derivations.length !== inputIndexes.length)
    return { status: 'error', reason: 'missing-input-derivation' };

  const fingerprint = bytesToHex(derivation.masterFingerprint);
  if (
    remainingDerivations.some(
      candidate =>
        candidate.path !== derivation.path ||
        bytesToHex(candidate.masterFingerprint) !== fingerprint
    )
  )
    return { status: 'error', reason: 'inconsistent-input-derivation' };

  return { status: 'success', derivation };
}

function getPathElements(path: string): string[] {
  return path.split('/').slice(1);
}

function getHardenedPrefixPath(path: string): string {
  const elements = getPathElements(path);
  const hardenedLength = elements.reduce(
    (length, element, index) => (element.endsWith(hardenedMarker) ? index + 1 : length),
    0
  );
  return [masterPath, ...elements.slice(0, hardenedLength)].join('/');
}

function getChildIndex(element: string): number {
  const isHardened = element.endsWith(hardenedMarker);
  const index = Number(isHardened ? element.slice(0, -hardenedMarker.length) : element);
  return isHardened ? index + HARDENED_OFFSET : index;
}

function isKeychainAtPath(keychain: HDKey, path: string): boolean {
  const elements = getPathElements(path);
  if (keychain.depth !== elements.length) return false;
  const lastElement = elements.at(-1);
  return lastElement === undefined || keychain.index === getChildIndex(lastElement);
}

function globalXpubMatchesDerivation(globalXpub: GlobalXpub, derivation: Bip32Derivation) {
  return (
    bytesToHex(globalXpub.masterFingerprint) === bytesToHex(derivation.masterFingerprint) &&
    globalXpub.path === getHardenedPrefixPath(derivation.path)
  );
}

function resolveGlobalXpubKeyExpression(
  globalXpub: GlobalXpub,
  derivation: Bip32Derivation,
  publicKey: string
): string | null {
  const keyPath = derivation.path.slice(globalXpub.path.length);
  try {
    const xpub = base58check.encode(globalXpub.extendedPubkey);
    const keychain = deriveKeychainFromXpub(xpub);
    if (!isKeychainAtPath(keychain, globalXpub.path)) return null;

    const derivedKeychain = keyPath ? keychain.derive(masterPath + keyPath) : keychain;
    if (!derivedKeychain.publicKey || bytesToHex(derivedKeychain.publicKey) !== publicKey)
      return null;

    return xpub + keyPath;
  } catch {
    return null;
  }
}

function compilesToSameScripts(descriptor: string, compiled: CompiledWshDescriptor): boolean {
  try {
    const resolved = compileWshDescriptor(descriptor);
    return (
      bytesToHex(resolved.scriptPubKey) === bytesToHex(compiled.scriptPubKey) &&
      bytesToHex(resolved.witnessScript) === bytesToHex(compiled.witnessScript)
    );
  } catch {
    return false;
  }
}

export function resolveLedgerSignableDescriptor({
  descriptor,
  psbt: rawPsbt,
  inputIndexes,
  accountKey,
}: ResolveLedgerSignableDescriptorArgs): LedgerDescriptorResolution {
  const compiled = compileWshDescriptor(descriptor);
  const foreignKeys = getForeignRawPublicKeys(compiled.keys, accountKey);
  const [firstForeignKey] = foreignKeys;
  if (!firstForeignKey) return { status: 'success', descriptor };

  const psbt = Psbt.fromBuffer(rawPsbt);
  const globalXpubs = psbt.data.globalMap.globalXpub ?? [];
  const replacements = new Map<string, string>();

  for (const rawKey of foreignKeys) {
    const publicKey = bytesToHex(rawKey.pubkey);
    const inputDerivation = getInputDerivation(psbt, inputIndexes, publicKey);
    if (inputDerivation.status === 'error')
      return resolutionError(inputDerivation.reason, publicKey);

    const originGlobalXpubs = globalXpubs.filter(globalXpub =>
      globalXpubMatchesDerivation(globalXpub, inputDerivation.derivation)
    );
    if (!originGlobalXpubs.length) return resolutionError('missing-global-xpub', publicKey);

    const [keyExpression, ...ambiguousKeyExpressions] = originGlobalXpubs.flatMap(
      globalXpub =>
        resolveGlobalXpubKeyExpression(globalXpub, inputDerivation.derivation, publicKey) ?? []
    );
    if (!keyExpression) return resolutionError('incompatible-global-xpub', publicKey);
    if (ambiguousKeyExpressions.length) return resolutionError('ambiguous-global-xpub', publicKey);

    replacements.set(rawKey.keyExpression, keyExpression);
  }

  const resolvedDescriptor = Array.from(replacements).reduce(
    (current, [rawKeyExpression, keyExpression]) =>
      current.replaceAll(rawKeyExpression, keyExpression),
    stripDescriptorChecksum(descriptor)
  );
  if (!compilesToSameScripts(resolvedDescriptor, compiled))
    return resolutionError('incompatible-global-xpub', bytesToHex(firstForeignKey.pubkey));

  return { status: 'success', descriptor: resolvedDescriptor };
}
