import { isHexString } from '@leather.io/utils';

export enum DerivationPathDepth {
  Root = 0,
  Purpose = 1,
  CoinType = 2,
  Account = 3,
  ChangeReceive = 4,
  AddressIndex = 5,
}

export function extractSectionFromDerivationPath(depth: DerivationPathDepth) {
  return (path: string) => {
    const segments = path.split('/');
    const accountNum = parseInt(segments[depth].replaceAll("'", ''), 10);
    if (isNaN(accountNum)) throw new Error(`Cannot parse ${DerivationPathDepth[depth]} from path`);
    return accountNum;
  };
}

export const extractPurposeFromPath = extractSectionFromDerivationPath(DerivationPathDepth.Purpose);

export const extractAccountIndexFromPath = extractSectionFromDerivationPath(
  DerivationPathDepth.Account
);

export const extractAddressIndexFromPath = extractSectionFromDerivationPath(
  DerivationPathDepth.AddressIndex
);

export function appendAddressIndexToPath(path: string, index: number) {
  const accountIndex = extractAccountIndexFromPath(path);
  if (!Number.isInteger(accountIndex)) throw new Error('Invalid path, must have account index');
  const assumedReceiveChangeIndex = 0;
  return `${path}/${assumedReceiveChangeIndex}/${index}`;
}

export function extractFingerprintFromKeyOriginPath(keyOriginPath: string) {
  const fingerprint = keyOriginPath.split('/')[0];
  if (!isHexString(fingerprint)) throw new Error('Fingerprint must be a hexadecimal string');
  return fingerprint;
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
  if (!isHexString(fingerprint)) throw new Error('Fingerprint must be a hexadecimal string');
  return `${fingerprint}/${path.replace('m/', '')}`;
}

export function validateKeyOriginPath(keyOriginPath: string) {
  if (keyOriginPath.includes('[') || keyOriginPath.includes(']'))
    throw new Error('Key origin path should not contain square brackets');

  if (!keyOriginPath.includes('/'))
    throw new Error('Key origin path must contain a fingerprint and derivation path');

  if (!isHexString(extractFingerprintFromKeyOriginPath(keyOriginPath)))
    throw new Error('Fingerprint must be a hexadecimal string');

  if (keyOriginPath.split('/').length < 4)
    throw new Error('Key origin path is too short. Should describe at least to the account level');

  return true;
}

/**
 * @description
 * Creates a descriptor with key origin and xpub or public key
 * @returns `[0a3fd8ef/84'/0'/0']xpuba1b…2c3`
 */
export function createDescriptor(keyOriginPath: string, key: string) {
  validateKeyOriginPath(keyOriginPath);
  return `[${keyOriginPath}]${key}`;
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `0a3fd8ef/84'/0'/0'`
 */
export function extractKeyOriginPathFromDescriptor(descriptor: string) {
  const keyOriginPath = descriptor.split(']')[0].replace('[', '');
  validateKeyOriginPath(keyOriginPath);
  return keyOriginPath;
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `m/84'/0'/0'`
 */
export function extractDerivationPathFromDescriptor(descriptor: string) {
  const keyOriginPath = extractKeyOriginPathFromDescriptor(descriptor);
  return 'm/' + keyOriginPath.split('/').slice(1).join('/');
}

/**
 * @example `[0a3fd8ef/84'/0'/0']xpuba1b…2c3` -> `0a3fd8ef`
 */
export function extractFingerprintFromDescriptor(descriptor: string) {
  return extractFingerprintFromKeyOriginPath(extractKeyOriginPathFromDescriptor(descriptor));
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
  return descriptor.split(']')[1];
}

export function keyOriginToDerivationPath(keyOrigin: string) {
  const [_fingerprint, ...remainingPath] = keyOrigin.split('/');
  return `m/${remainingPath.join('/')}`;
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
