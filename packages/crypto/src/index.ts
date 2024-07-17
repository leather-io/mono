import { HDKey } from '@scure/bip32';
import { mnemonicToSeed, generateMnemonic as scureGenerateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export * from './derivation-path-utils';

export function generateMnemonic() {
  return scureGenerateMnemonic(wordlist, 256);
}

export async function deriveBip39SeedFromMnemonic(mnemonic: string) {
  return mnemonicToSeed(mnemonic);
}

export function deriveRootBip32Keychain(seed: Uint8Array) {
  return HDKey.fromMasterSeed(seed);
}

/**
 * Gets keychain fingerprint directly from mnemonic. This is useful for
 * referencing a mnemonic safely by an identifier.
 */
export async function getMnemonicRootKeyFingerprint(mnemonic: string) {
  const keychain = deriveRootBip32Keychain(await deriveBip39SeedFromMnemonic(mnemonic));
  return keychain.fingerprint.toString(16);
}
