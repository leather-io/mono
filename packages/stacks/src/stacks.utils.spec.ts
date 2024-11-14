import { HDKey } from '@scure/bip32';
import { ChainID } from '@stacks/transactions';

import { deriveBip39SeedFromMnemonic } from '@leather.io/crypto';

import { testMnemonic } from '../../../config/test-helpers';
import {
  cleanHex,
  deriveStxPrivateKey,
  getStacksBurnAddress,
  getStacksContractAssetName,
  getStacksContractIdStringParts,
  getStacksContractName,
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

describe(getStacksBurnAddress.name, () => {
  it('should return the correct burn address for Mainnet', () => {
    const result = getStacksBurnAddress(ChainID.Mainnet);
    expect(result).toBe('SP00000000000003SCNSJTCSE62ZF4MSE');
  });

  it('should return the correct burn address for Testnet', () => {
    const result = getStacksBurnAddress(ChainID.Testnet);
    expect(result).toBe('ST000000000000000000002AMW42H');
  });

  it('should return the Testnet address for an unknown chainId', () => {
    const result = getStacksBurnAddress(9999 as ChainID); // Simulate an unknown chainId
    expect(result).toBe('ST000000000000000000002AMW42H');
  });
});

describe(cleanHex.name, () => {
  test('should return the same string if it is not a hex string', () => {
    expect(cleanHex('not-a-hex')).toBe('not-a-hex');
  });

  test('should remove 0x prefix from hex string', () => {
    expect(cleanHex('0xabcdef')).toBe('abcdef');
  });

  test('should return the same hex string if it does not have 0x prefix', () => {
    expect(cleanHex('abcdef')).toBe('abcdef');
  });
});

describe(getStacksContractName.name, () => {
  test('should return contract name from fully qualified name', () => {
    expect(getStacksContractName('SP1234.contract-name')).toBe('contract-name');
  });

  test('should return contract name from fully qualified name with asset', () => {
    expect(getStacksContractName('SP1234.contract-name::asset-name')).toBe('contract-name');
  });

  test('should return the same string if it does not contain a dot', () => {
    expect(getStacksContractName('contract-name')).toBe('contract-name');
  });
});

describe('getStacksContractAssetName', () => {
  test('should return asset name from fully qualified name', () => {
    expect(getStacksContractAssetName('SP1234.contract-name::asset-name')).toBe('asset-name');
  });

  test('should return the same string if it does not contain ::', () => {
    expect(getStacksContractAssetName('contract-name')).toBe('contract-name');
  });
});

describe(getStacksContractIdStringParts.name, () => {
  test('should return parts of a fully qualified name', () => {
    const result = getStacksContractIdStringParts('SP1234.contract-name::asset-name');
    expect(result).toEqual({
      contractAddress: 'SP1234',
      contractAssetName: 'asset-name',
      contractName: 'contract-name',
    });
  });

  test('should return the same string for all parts if it does not contain . or ::', () => {
    const result = getStacksContractIdStringParts('contract-name');
    expect(result).toEqual({
      contractAddress: 'contract-name',
      contractAssetName: 'contract-name',
      contractName: 'contract-name',
    });
  });
});
