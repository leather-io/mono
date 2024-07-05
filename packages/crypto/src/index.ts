import { HDKey } from '@scure/bip32';
import { mnemonicToSeed, generateMnemonic as scureGenerateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export * from './derivation-path-utils';

export function generateMnemonic() {
  return scureGenerateMnemonic(wordlist, 256);
}

export async function deriveBip39MnemonicFromSeed(mnemonic: string) {
  return mnemonicToSeed(mnemonic);
}

export function deriveRootBip32Keychain(seed: Uint8Array) {
  return HDKey.fromMasterSeed(seed);
}
