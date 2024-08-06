import { HDKey } from '@scure/bip32';
import { mnemonicToSeed, generateMnemonic as scureGenerateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { toHexString } from '@leather.io/utils';

import {
  DerivationPathDepth,
  createExtendedPublicKeyDescriptor,
  createKeyOriginPath,
} from './derivation-path-utils';

export function generateMnemonic() {
  return scureGenerateMnemonic(wordlist, 256);
}

export async function deriveBip39SeedFromMnemonic(mnemonic: string, passphrase?: string) {
  return mnemonicToSeed(mnemonic, passphrase);
}
/** @deprecated Inaccurately named fn, use `deriveBip39SeedFromMnemonic` */
export const deriveBip39MnemonicFromSeed = deriveBip39SeedFromMnemonic;

export function deriveRootBip32Keychain(seed: Uint8Array) {
  return HDKey.fromMasterSeed(seed);
}

export function deriveKeychainFromXpub(xpub: string) {
  return HDKey.fromExtendedKey(xpub);
}

/**
 * Gets keychain fingerprint directly from mnemonic. This is useful for
 * referencing a mnemonic safely by an identifier.
 */
export async function getMnemonicRootKeyFingerprint(mnemonic: string, passphrase?: string) {
  const keychain = deriveRootBip32Keychain(await deriveBip39SeedFromMnemonic(mnemonic, passphrase));
  return toHexString(keychain.fingerprint);
}

export function deriveKeychainDescriptor(rootKeychain: HDKey, path: string) {
  const masterFingerprint = toHexString(rootKeychain.fingerprint);
  const keyOriginPath = createKeyOriginPath(masterFingerprint, path);

  if (rootKeychain.depth !== DerivationPathDepth.Root)
    throw new Error('Cannot derive account keychain from non-root keychain');

  const accountKeychain = rootKeychain.derive(path);
  return createExtendedPublicKeyDescriptor(keyOriginPath, accountKeychain.publicExtendedKey);
}
