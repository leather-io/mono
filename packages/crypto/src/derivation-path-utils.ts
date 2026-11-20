import {
  accountKeyOriginPath,
  accountLevelSegments,
  derivationPath,
  descriptorText,
  keyOriginPathOfAnyDepth,
  rootedPath,
} from './derivation-path.kernel';

export const DerivationPathDepth = {
  Root: 0,
  Purpose: 1,
  /** @knipignore */
  CoinType: 2,
  Account: 3,
  Change: 4,
  AddressIndex: 5,
} as const;
export type DerivationPathDepth = (typeof DerivationPathDepth)[keyof typeof DerivationPathDepth];

type DerivationPathDepthName = keyof typeof DerivationPathDepth;

function extractSectionFromDerivationPath(depthName: DerivationPathDepthName) {
  return (path: string) => {
    const [, segments] = rootedPath.parse(path);
    const segment = segments[DerivationPathDepth[depthName] - 1];
    if (!segment) throw new Error(`Cannot parse ${depthName} from path`);
    return segment[0];
  };
}

export const extractPurposeFromPath = extractSectionFromDerivationPath('Purpose');

export const extractAccountIndexFromPath = extractSectionFromDerivationPath('Account');

export const extractChangeIndexFromPath = extractSectionFromDerivationPath('Change');

export const extractAddressIndexFromPath = extractSectionFromDerivationPath('AddressIndex');

export function appendAddressIndexToPath(path: string, change: number, addressIndex: number) {
  const [root, segments] = rootedPath.parse(path);
  if (segments.length < accountLevelSegments)
    throw new Error('Invalid path, must have account index');
  return rootedPath.print([root, [...segments, [change, false], [addressIndex, false]]]);
}

export function extractFingerprintFromKeyOriginPath(keyOriginPath: string) {
  return keyOriginPathOfAnyDepth.parse(keyOriginPath)[0];
}

/**
 * @description
 * A key origin path refers to the identifier commonly used as part of the key
 * information provided as part of a Output Descriptor described in BIP-380. It
 * replaces the `m/` part of a derivation path with the master key fingerprint to which the
 * key it describes belongs.
 * @example `0a3fd8ef/84'/0'/0'`
 */
export function createKeyOriginPath(fingerprint: string, path: string) {
  return keyOriginPathOfAnyDepth.print([fingerprint, derivationPath.parse(path)]);
}

export function createKeyOriginPathFromSegments(
  fingerprint: string,
  segments: [index: number, hardened: boolean][]
) {
  return keyOriginPathOfAnyDepth.print([fingerprint, segments]);
}

export function validateKeyOriginPath(keyOriginPath: string) {
  accountKeyOriginPath.parse(keyOriginPath);
  return true;
}

/**
 * @description
 * Creates a descriptor with key origin and xpub or public key
 * @returns `[0a3fd8ef/84'/0'/0']xpuba1b…2c3`
 */
export function createDescriptor(keyOriginPath: string, key: string) {
  return descriptorText.print([accountKeyOriginPath.parse(keyOriginPath), key]);
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `0a3fd8ef/84'/0'/0'`
 */
export function extractKeyOriginPathFromDescriptor(descriptor: string) {
  return accountKeyOriginPath.print(descriptorText.parse(descriptor)[0]);
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `m/84'/0'/0'`
 */
export function extractDerivationPathFromDescriptor(descriptor: string) {
  const [[, segments]] = descriptorText.parse(descriptor);
  return derivationPath.print(segments);
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `0a3fd8ef`
 */
export function extractFingerprintFromDescriptor(descriptor: string) {
  const [[fingerprint]] = descriptorText.parse(descriptor);
  return fingerprint;
}

/**
 * @example `[0a3fd8ef/84'/0'/6']xpuba1b…2c3` -> `6`
 */
export function extractAccountIndexFromDescriptor(descriptor: string) {
  return extractAccountIndexFromPath(extractKeyOriginPathFromDescriptor(descriptor));
}

/**
 * @example `[0a3fd8ef/84'/0'/6']xpuba1b…2c3` -> `xpuba1b…2c3`
 */
export function extractKeyFromDescriptor(descriptor: string) {
  return descriptorText.parse(descriptor)[1];
}

/**
 * @example `0a3fd8ef/84'/0'/0/0/0` -> `0a3fd8ef/84'/0'/0`
 */
export function extractAccountPathFromFullPath(path: string) {
  const [root, segments] = rootedPath.parse(path);
  return rootedPath.print([root, segments.slice(0, accountLevelSegments)]);
}

export function keyOriginToDerivationPath(keyOrigin: string) {
  return derivationPath.print(keyOriginPathOfAnyDepth.parse(keyOrigin)[1]);
}

export function decomposeDescriptor(descriptor: string) {
  return {
    descriptor,
    keyOrigin: extractKeyOriginPathFromDescriptor(descriptor),
    fingerprint: extractFingerprintFromDescriptor(descriptor),
    derivationPath: extractDerivationPathFromDescriptor(descriptor),
    accountIndex: extractAccountIndexFromDescriptor(descriptor),
  };
}
