import { HDKey } from '@scure/bip32';
import {
  mnemonicToSeed,
  mnemonicToSeedSync,
  generateMnemonic as scureGenerateMnemonic,
  validateMnemonic,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import memoize from 'just-memoize';

import {
  DerivationPathDepth,
  createDescriptor,
  createKeyOriginPath,
  keyOriginToDerivationPath,
} from './derivation-path-utils';

export function generateMnemonic() {
  return scureGenerateMnemonic(wordlist, 256);
}

export async function deriveBip39SeedFromMnemonic(mnemonic: string, passphrase?: string) {
  return mnemonicToSeed(mnemonic, passphrase);
}

export function deriveBip39SeedFromMnemonicSync(mnemonic: string, passphrase?: string) {
  return mnemonicToSeedSync(mnemonic, passphrase);
}

/** @deprecated Inaccurately named fn, use `deriveBip39SeedFromMnemonic` */
export const deriveBip39MnemonicFromSeed = deriveBip39SeedFromMnemonic;

export function deriveRootBip32Keychain(seed: Uint8Array) {
  return HDKey.fromMasterSeed(seed);
}

export async function deriveRootKeychainFromMnemonic(mnemonic: string, passphrase?: string) {
  return deriveRootBip32Keychain(await deriveBip39SeedFromMnemonic(mnemonic, passphrase));
}

export function deriveRootKeychainFromMnemonicSync(mnemonic: string, passphrase?: string) {
  return deriveRootBip32Keychain(deriveBip39SeedFromMnemonicSync(mnemonic, passphrase));
}

export async function deriveChildKeychainFromMnemnonic(
  path: string,
  mnemonic: string,
  passphrase?: string
) {
  const rootKeychain = deriveRootBip32Keychain(await mnemonicToSeed(mnemonic, passphrase));
  return rootKeychain.derive(keyOriginToDerivationPath(path));
}

export const deriveKeychainFromXpub = memoize((xpub: string) => HDKey.fromExtendedKey(xpub));

export function fingerprintAsNumberToHex(fingerprint: number) {
  return fingerprint.toString(16).padStart(8, '0');
}

export function safelyReadPaddedFingerprint(fingerprintHex: string) {
  if (fingerprintHex.length < 8) {
    return fingerprintHex.padStart(8, '0');
  }
  return fingerprintHex;
}

export function unpadHex(hex: string) {
  return BigInt('0x' + hex).toString(16);
}

/**
 * Gets keychain fingerprint directly from mnemonic. This is useful for
 * referencing a mnemonic safely by an identifier.
 */
export function getMnemonicRootKeyFingerprint(mnemonic: string, passphrase?: string) {
  const keychain = deriveRootBip32Keychain(deriveBip39SeedFromMnemonicSync(mnemonic, passphrase));
  return fingerprintAsNumberToHex(keychain.fingerprint);
}

export function deriveKeychainExtendedPublicKeyDescriptor(rootKeychain: HDKey, path: string) {
  const masterFingerprint = fingerprintAsNumberToHex(rootKeychain.fingerprint);
  const keyOriginPath = createKeyOriginPath(masterFingerprint, path);

  if (rootKeychain.depth !== DerivationPathDepth.Root)
    throw new Error('Cannot derive account keychain from non-root keychain');

  const accountKeychain = rootKeychain.derive(path);
  return createDescriptor(keyOriginPath, accountKeychain.publicExtendedKey);
}

export function isValidMnemonicWord(word: string): boolean {
  return wordlist.includes(word);
}

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist);
}

/**
 * Create a unique accountId using wallet's fingerprint and accountIndex
 */
export function makeAccountIdentifer(fingerprint: string, accountIndex: number) {
  return [fingerprint, accountIndex].join('/');
}
