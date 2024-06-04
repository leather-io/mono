import { HDKey } from '@scure/bip32';
import { mnemonicToSeed } from '@scure/bip39';

export * from './derivation-path-utils';

export async function deriveBip39MnemonicFromSeed(mnemonic: string) {
  return mnemonicToSeed(mnemonic);
}

export function deriveRootBip32Keychain(seed: Uint8Array) {
  return HDKey.fromMasterSeed(seed);
}
