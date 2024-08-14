import { HDKey } from '@scure/bip32';
import { ChainID } from '@stacks/transactions';

import { deriveBip39SeedFromMnemonic } from '@leather.io/crypto';

import { testMnemonic } from '../../../config/test-helpers';
import {
  deriveStxPrivateKey,
  stacksRootKeychainToAccountDescriptor,
  whenStacksChainId,
} from './stacks.utils';

const testMnemonicKeychain = HDKey.fromMasterSeed(await deriveBip39SeedFromMnemonic(testMnemonic));

describe(whenStacksChainId.name, () => {
  const expectedResult = 'should be this value';
  test('that it returns testnet when given a testnet chain id', () => {
    expect(
      whenStacksChainId(ChainID.Testnet)({
        [ChainID.Testnet]: expectedResult,
        [ChainID.Mainnet]: 'One plus one equals two.',
      })
    ).toEqual(expectedResult);
  });
  test('that it returns mainnet when given a mainnet chain id', () => {
    const expectedResult = 'should be this value';
    expect(
      whenStacksChainId(ChainID.Mainnet)({
        [ChainID.Testnet]: 'The capital city of Mongolia is Ulaanbaatar.',
        [ChainID.Mainnet]: expectedResult,
      })
    ).toEqual(expectedResult);
  });
});

describe(deriveStxPrivateKey.name, () => {
  test('that it throws an error when the keychain depth is not 0', () => {
    // accounts can only be made from this method via a root keychain
    expect(() =>
      deriveStxPrivateKey({ keychain: testMnemonicKeychain.deriveChild(0), index: 0 })
    ).toThrowError();
  });

  test('that it returns a compressed private key', () => {
    const accountZeroPrivateKey = deriveStxPrivateKey({ keychain: testMnemonicKeychain, index: 0 });
    expect(accountZeroPrivateKey).toEqual(
      'ed8c73dc144ac6587d4034aae5416ac8bdd64a70dee65e736a7d12765eab6cc301'
    );
  });
});

describe(stacksRootKeychainToAccountDescriptor.name, () => {
  test('it derives the correct descriptor', () => {
    const descriptor = stacksRootKeychainToAccountDescriptor(testMnemonicKeychain, 0);
    expect(descriptor).toEqual(
      "[24682ead/44'/5757'/0'/0/0]025b2c58cbf22ad02e1a53041189ace847192834e0664cab4ed1a39676e8a8ddf8"
    );
  });
});
