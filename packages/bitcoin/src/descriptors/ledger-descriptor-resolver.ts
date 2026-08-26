import { type KeyInfo } from '@bitcoinerlab/descriptors';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { createBase58check } from '@scure/base';
import { Psbt } from 'bitcoinjs-lib';

import { deriveKeychainFromXpub } from '@leather.io/crypto';

import { compileWshDescriptor, stripDescriptorChecksum } from './wsh-descriptor';

const hardenedIndexOffset = 0x80000000;
const base58check = createBase58check(sha256);

type GlobalXpub = NonNullable<Psbt['data']['globalMap']['globalXpub']>[number];
type InputBip32Derivation = NonNullable<Psbt['data']['inputs'][number]['bip32Derivation']>[number];

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
  accountKey: KeyInfo;
}

interface ParsedDerivationPath {
  elements: string[];
}

interface InputDerivationSuccess {
  status: 'success';
  derivation: InputBip32Derivation;
}

interface InputDerivationError {
  status: 'error';
  reason: 'inconsistent-input-derivation' | 'missing-input-derivation';
}

type InputDerivationResult = InputDerivationSuccess | InputDerivationError;

interface ResolvedGlobalXpub {
  keyExpression: string;
}

interface DescriptorKeyReplacement {
  keyExpression: string;
  replacement: string;
}

function parseDerivationPath(path: string): ParsedDerivationPath | null {
  if (path === 'm') return { elements: [] };
  if (!path.startsWith('m/')) return null;

  const elements = path.slice(2).split('/');
  if (!elements.every(isValidDerivationPathElement)) return null;
  return { elements };
}

function isValidDerivationPathElement(element: string): boolean {
  const value = element.endsWith("'") ? element.slice(0, -1) : element;
  if (!/^(0|[1-9]\d*)$/.test(value)) return false;
  const index = Number(value);
  return Number.isSafeInteger(index) && index < hardenedIndexOffset;
}

function getDerivationPathElementIndex(element: string): number {
  const isHardened = element.endsWith("'");
  const value = Number(isHardened ? element.slice(0, -1) : element);
  return isHardened ? value + hardenedIndexOffset : value;
}

function getHighestHardenedPath(elements: string[]): string {
  const highestHardenedIndex = elements.reduce(
    (highest, element, index) => (element.endsWith("'") ? index : highest),
    -1
  );
  if (highestHardenedIndex === -1) return 'm';
  return `m/${elements.slice(0, highestHardenedIndex + 1).join('/')}`;
}

function getRelativePathElements(rootPath: string, fullPath: string): string[] | null {
  const parsedRootPath = parseDerivationPath(rootPath);
  const parsedFullPath = parseDerivationPath(fullPath);
  if (!parsedRootPath || !parsedFullPath) return null;
  if (getHighestHardenedPath(parsedFullPath.elements) !== rootPath) return null;
  if (parsedRootPath.elements.some((element, index) => parsedFullPath.elements[index] !== element))
    return null;

  return parsedFullPath.elements.slice(parsedRootPath.elements.length);
}

function getInputDerivation(
  psbt: Psbt,
  inputIndexes: number[],
  publicKey: Uint8Array
): InputDerivationResult {
  const publicKeyHex = bytesToHex(publicKey);
  const derivations = inputIndexes.map(index =>
    psbt.data.inputs[index]?.bip32Derivation?.find(
      derivation => bytesToHex(derivation.pubkey) === publicKeyHex
    )
  );
  const [firstDerivation, ...remainingDerivations] = derivations;
  if (!firstDerivation || remainingDerivations.some(derivation => !derivation))
    return { status: 'error', reason: 'missing-input-derivation' };

  const fingerprint = bytesToHex(firstDerivation.masterFingerprint);
  if (
    remainingDerivations.some(
      derivation =>
        derivation?.path !== firstDerivation.path ||
        bytesToHex(derivation.masterFingerprint) !== fingerprint
    )
  )
    return { status: 'error', reason: 'inconsistent-input-derivation' };

  return { status: 'success', derivation: firstDerivation };
}

function globalXpubMatchesDerivationOrigin(
  globalXpub: GlobalXpub,
  derivation: InputBip32Derivation
): boolean {
  if (bytesToHex(globalXpub.masterFingerprint) !== bytesToHex(derivation.masterFingerprint))
    return false;
  const parsedDerivationPath = parseDerivationPath(derivation.path);
  if (!parsedDerivationPath) return false;
  return getHighestHardenedPath(parsedDerivationPath.elements) === globalXpub.path;
}

function resolveGlobalXpub(
  globalXpub: GlobalXpub,
  derivation: InputBip32Derivation,
  publicKey: Uint8Array
): ResolvedGlobalXpub | null {
  if (!globalXpubMatchesDerivationOrigin(globalXpub, derivation)) return null;

  const relativePathElements = getRelativePathElements(globalXpub.path, derivation.path);
  const parsedGlobalPath = parseDerivationPath(globalXpub.path);
  if (!relativePathElements || !parsedGlobalPath) return null;

  try {
    const xpub = base58check.encode(globalXpub.extendedPubkey);
    const keychain = deriveKeychainFromXpub(xpub);
    if (keychain.depth !== parsedGlobalPath.elements.length) return null;

    const finalGlobalPathElement = parsedGlobalPath.elements.at(-1);
    if (
      finalGlobalPathElement &&
      keychain.index !== getDerivationPathElementIndex(finalGlobalPathElement)
    )
      return null;

    const derivedKeychain = relativePathElements.reduce(
      (child, element) => child.deriveChild(getDerivationPathElementIndex(element)),
      keychain
    );
    if (
      !derivedKeychain.publicKey ||
      bytesToHex(derivedKeychain.publicKey) !== bytesToHex(publicKey)
    )
      return null;

    const fingerprint = bytesToHex(globalXpub.masterFingerprint);
    const origin = globalXpub.path === 'm' ? fingerprint : fingerprint + globalXpub.path.slice(1);
    const relativePath = relativePathElements.length ? '/' + relativePathElements.join('/') : '';
    return { keyExpression: `[${origin}]${xpub}${relativePath}` };
  } catch {
    return null;
  }
}

function isResolvedGlobalXpub(
  resolvedGlobalXpub: ResolvedGlobalXpub | null
): resolvedGlobalXpub is ResolvedGlobalXpub {
  return resolvedGlobalXpub !== null;
}

function getForeignRawKeys(keys: KeyInfo[], accountKey: KeyInfo): KeyInfo[] {
  const accountPublicKey = accountKey.pubkey ? bytesToHex(accountKey.pubkey) : null;
  return keys.filter(
    (key, index, descriptorKeys) =>
      !key.bip32 &&
      !!key.pubkey &&
      bytesToHex(key.pubkey) !== accountPublicKey &&
      descriptorKeys.findIndex(candidate => candidate.keyExpression === key.keyExpression) === index
  );
}

function resolutionError(
  reason: LedgerDescriptorResolutionErrorReason,
  publicKey: string
): LedgerDescriptorResolutionError {
  return { status: 'error', reason, publicKey };
}

export function resolveLedgerSignableDescriptor({
  descriptor,
  psbt: rawPsbt,
  inputIndexes,
  accountKey,
}: ResolveLedgerSignableDescriptorArgs): LedgerDescriptorResolution {
  const compiled = compileWshDescriptor(descriptor);
  const originalScriptPubKey = bytesToHex(compiled.scriptPubKey);
  const originalWitnessScript = bytesToHex(compiled.witnessScript);
  const psbt = Psbt.fromBuffer(Buffer.from(rawPsbt));
  const globalXpubs = psbt.data.globalMap.globalXpub ?? [];
  const foreignRawKeys = getForeignRawKeys(compiled.keys, accountKey);
  const replacements: DescriptorKeyReplacement[] = [];

  for (const rawKey of foreignRawKeys) {
    const rawPublicKey = rawKey.pubkey;
    if (!rawPublicKey) return resolutionError('incompatible-global-xpub', rawKey.keyExpression);

    const publicKey = bytesToHex(rawPublicKey);
    const inputDerivation = getInputDerivation(psbt, inputIndexes, rawPublicKey);
    if (inputDerivation.status === 'error')
      return resolutionError(inputDerivation.reason, publicKey);

    const matchingOriginGlobalXpubs = globalXpubs.filter(globalXpub =>
      globalXpubMatchesDerivationOrigin(globalXpub, inputDerivation.derivation)
    );
    const matchingGlobalXpubs = matchingOriginGlobalXpubs
      .map(globalXpub => resolveGlobalXpub(globalXpub, inputDerivation.derivation, rawPublicKey))
      .filter(isResolvedGlobalXpub);
    if (!matchingOriginGlobalXpubs.length) return resolutionError('missing-global-xpub', publicKey);
    if (!matchingGlobalXpubs.length) return resolutionError('incompatible-global-xpub', publicKey);
    if (matchingGlobalXpubs.length > 1) return resolutionError('ambiguous-global-xpub', publicKey);

    const [matchingGlobalXpub] = matchingGlobalXpubs;
    if (!matchingGlobalXpub) return resolutionError('missing-global-xpub', publicKey);
    replacements.push({
      keyExpression: rawKey.keyExpression.split('/')[0],
      replacement: matchingGlobalXpub.keyExpression,
    });
  }

  const resolvedDescriptor = replacements.length
    ? replacements.reduce(
        (current, replacement) =>
          current.replaceAll(replacement.keyExpression, replacement.replacement),
        stripDescriptorChecksum(descriptor)
      )
    : descriptor;

  try {
    const resolved = compileWshDescriptor(resolvedDescriptor);
    if (
      bytesToHex(resolved.scriptPubKey) !== originalScriptPubKey ||
      bytesToHex(resolved.witnessScript) !== originalWitnessScript
    )
      return resolutionError('incompatible-global-xpub', replacements[0]?.keyExpression ?? '');
  } catch {
    return resolutionError('incompatible-global-xpub', replacements[0]?.keyExpression ?? '');
  }

  return { status: 'success', descriptor: resolvedDescriptor };
}
