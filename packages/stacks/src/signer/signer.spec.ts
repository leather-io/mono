import { HDKey } from '@scure/bip32';

import { deriveBip39SeedFromMnemonic } from '@leather.io/crypto';

import { testMnemonic } from '../../../../config/test-helpers';
import { stacksRootKeychainToAccountDescriptor } from '../stacks.utils';
import { initalizeStacksSigner } from './signer';

const testMnemonicKeychain = HDKey.fromMasterSeed(await deriveBip39SeedFromMnemonic(testMnemonic));

describe(initalizeStacksSigner.name, () => {
  const descriptor = stacksRootKeychainToAccountDescriptor(testMnemonicKeychain, 0);

  test('it derives the correct mainnet address', () => {
    const account = initalizeStacksSigner({
      descriptor,
      network: 'mainnet',
      signFn: tx => Promise.resolve(tx),
    });
    expect(account.address).toEqual('SP148VBW07WJ81V6B1FM0QP4AKB14QSRQQXERFRRV');
  });

  test('it derives the correct testnet address', () => {
    const account = initalizeStacksSigner({
      descriptor,
      network: 'testnet',
      signFn: tx => Promise.resolve(tx),
    });
    expect(account.address).toEqual('ST148VBW07WJ81V6B1FM0QP4AKB14QSRQQZ717SWG');
  });
});
