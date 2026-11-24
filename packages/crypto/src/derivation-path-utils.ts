import {
  accountDerivationPath,
  accountKeyOriginPath,
  accountLevelPath,
  derivationPath,
  descriptorText,
  keyOriginPathFromSegments,
  keyOriginPathOfAnyDepth,
  pathToAccount,
  pathToAddressIndex,
  pathToChange,
  pathToPurpose,
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

export function extractPurposeFromPath(path: string) {
  const [purpose] = pathToPurpose.parse(path).purpose;
  return purpose;
}

export function extractAccountIndexFromPath(path: string) {
  const [accountIndex] = pathToAccount.parse(path).account;
  return accountIndex;
}

export function extractChangeIndexFromPath(path: string) {
  const [changeIndex] = pathToChange.parse(path).change;
  return changeIndex;
}

export function extractAddressIndexFromPath(path: string) {
  const [addressIndex] = pathToAddressIndex.parse(path).addressIndex;
  return addressIndex;
}

export function appendAddressIndexToPath(path: string, change: number, addressIndex: number) {
  const parts = pathToAccount.parse(path);
  return pathToAccount.print({
    ...parts,
    rest: [...parts.rest, [change, false], [addressIndex, false]],
  });
}

export function extractFingerprintFromKeyOriginPath(keyOriginPath: string) {
  return keyOriginPathOfAnyDepth.parse(keyOriginPath).fingerprint;
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
  return keyOriginPathOfAnyDepth.print({ fingerprint, path: derivationPath.parse(path) });
}

export function createKeyOriginPathFromSegments(
  fingerprint: string,
  segments: [index: number, hardened: boolean][]
) {
  return keyOriginPathFromSegments.print({ fingerprint, segments });
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
  return descriptorText.print({ keyOrigin: accountKeyOriginPath.parse(keyOriginPath), key });
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `0a3fd8ef/84'/0'/0'`
 */
export function extractKeyOriginPathFromDescriptor(descriptor: string) {
  return accountKeyOriginPath.print(descriptorText.parse(descriptor).keyOrigin);
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `m/84'/0'/0'`
 */
export function extractDerivationPathFromDescriptor(descriptor: string) {
  return accountDerivationPath.print(descriptorText.parse(descriptor).keyOrigin.path);
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `0a3fd8ef`
 */
export function extractFingerprintFromDescriptor(descriptor: string) {
  return descriptorText.parse(descriptor).keyOrigin.fingerprint;
}

/**
 * @example `[0a3fd8ef/84'/0'/6']xpuba1b…2c3` -> `6`
 */
export function extractAccountIndexFromDescriptor(descriptor: string) {
  const [accountIndex] = descriptorText.parse(descriptor).keyOrigin.path.account;
  return accountIndex;
}

/**
 * @example `[0a3fd8ef/84'/0'/6']xpuba1b…2c3` -> `xpuba1b…2c3`
 */
export function extractKeyFromDescriptor(descriptor: string) {
  return descriptorText.parse(descriptor).key;
}

/**
 * @example `0a3fd8ef/84'/0'/0/0/0` -> `0a3fd8ef/84'/0'/0`
 */
export function extractAccountPathFromFullPath(path: string) {
  const { root, purpose, coinType, account } = pathToAccount.parse(path);
  return accountLevelPath.print({ root, purpose, coinType, account });
}

export function keyOriginToDerivationPath(keyOrigin: string) {
  return derivationPath.print(keyOriginPathOfAnyDepth.parse(keyOrigin).path);
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
