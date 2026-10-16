import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { generateWallet } from '@stacks/wallet-sdk';

import { DATA_DERIVATION_PATH, deriveStacksSalt } from './stacks-address-gen';

describe(deriveStacksSalt.name, () => {
  test('it makes the same hash as wallet sdk', async () => {
    const mnemonic = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';
    const seed = mnemonicToSeedSync(mnemonic);
    const keychain = HDKey.fromMasterSeed(seed);

    const result = deriveStacksSalt(keychain.derive(DATA_DERIVATION_PATH));

    const { salt: walletSdkResult } = await generateWallet({ secretKey: mnemonic, password: '' });

    expect(result).toEqual(walletSdkResult);
  });
});
