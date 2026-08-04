import { HDKey } from '@scure/bip32';
import { ChainId } from '@stacks/network';

import { deriveBip39SeedFromMnemonic } from '@leather.io/crypto';
import { testMnemonic, testMnemonicWithLeadingZeros } from '@leather.io/test-config';

import {
  cleanHex,
  deriveStxPrivateKey,
  extractStacksDerivationPathAccountIndex,
  getStacksAssetStringParts,
  getStacksBurnAddress,
  getStacksContractAssetName,
  getStacksContractName,
  inferStacksDerivationPathType,
  makeLedgerLiveStxDerivationPath,
  makeStxDerivationPath,
  makeStxDerivationPathForType,
  stacksChainIdToCoreNetworkMode,
  stacksDerivationPathTypeFromPath,
  stacksRootKeychainToAccountDescriptor,
  stacksRootKeychainToAccountDescriptorV2,
  whenStacksChainId,
} from './stacks.utils';

const testMnemonicKeychain = HDKey.fromMasterSeed(await deriveBip39SeedFromMnemonic(testMnemonic));
const testMnemonicKeychainWithLeadingZeros = HDKey.fromMasterSeed(
  await deriveBip39SeedFromMnemonic(testMnemonicWithLeadingZeros)
);

describe(whenStacksChainId.name, () => {
  const expectedResult = 'should be this value';
  test('that it returns testnet when given a testnet chain id', () => {
    expect(
      whenStacksChainId(ChainId.Testnet)({
        [ChainId.Testnet]: expectedResult,
        [ChainId.Mainnet]: 'One plus one equals two.',
      })
    ).toEqual(expectedResult);
  });
  test('that it returns mainnet when given a mainnet chain id', () => {
    const expectedResult = 'should be this value';
    expect(
      whenStacksChainId(ChainId.Mainnet)({
        [ChainId.Testnet]: 'The capital city of Mongolia is Ulaanbaatar.',
        [ChainId.Mainnet]: expectedResult,
      })
    ).toEqual(expectedResult);
  });
  test('that it returns testnet when given an unknown custom chain id', () => {
    expect(
      whenStacksChainId(256)({
        [ChainId.Testnet]: expectedResult,
        [ChainId.Mainnet]: 'One plus one equals two.',
      })
    ).toEqual(expectedResult);
  });
});

describe(stacksChainIdToCoreNetworkMode.name, () => {
  test('that it returns mainnet for the mainnet chain id', () => {
    expect(stacksChainIdToCoreNetworkMode(ChainId.Mainnet)).toEqual('mainnet');
  });
  test('that it returns testnet for the testnet chain id', () => {
    expect(stacksChainIdToCoreNetworkMode(ChainId.Testnet)).toEqual('testnet');
  });
  test('that it returns testnet for an unknown custom chain id', () => {
    expect(stacksChainIdToCoreNetworkMode(256)).toEqual('testnet');
  });
});

describe(makeLedgerLiveStxDerivationPath.name, () => {
  test('that it increments the hardened account level', () => {
    expect(makeLedgerLiveStxDerivationPath(0)).toEqual(`m/44'/5757'/0'/0/0`);
    expect(makeLedgerLiveStxDerivationPath(3)).toEqual(`m/44'/5757'/3'/0/0`);
  });
});

describe(makeStxDerivationPathForType.name, () => {
  test('that it delegates to the matching path factory', () => {
    expect(makeStxDerivationPathForType('stacks', 4)).toEqual(makeStxDerivationPath(4));
    expect(makeStxDerivationPathForType('ledgerLive', 4)).toEqual(
      makeLedgerLiveStxDerivationPath(4)
    );
  });
});

describe(extractStacksDerivationPathAccountIndex.name, () => {
  test('that it throws for non-stacks paths', () => {
    expect(() => extractStacksDerivationPathAccountIndex(`m/84'/0'/0'/0/0`)).toThrowError();
  });

  test('that it extracts the address index for stacks standard inputs', () => {
    expect(extractStacksDerivationPathAccountIndex(`m/44'/5757'/0'/0/7`)).toEqual(7);
    expect(extractStacksDerivationPathAccountIndex(`24682ead/44'/5757'/0'/0/7`)).toEqual(7);
    expect(
      extractStacksDerivationPathAccountIndex(`[24682ead/44'/5757'/0'/0/7]025b2c58cbf22ad02e`)
    ).toEqual(7);
  });

  test('that it extracts the account level for ledger live inputs', () => {
    expect(extractStacksDerivationPathAccountIndex(`m/44'/5757'/7'/0/0`)).toEqual(7);
    expect(extractStacksDerivationPathAccountIndex(`24682ead/44'/5757'/7'/0/0`)).toEqual(7);
    expect(
      extractStacksDerivationPathAccountIndex(`[24682ead/44'/5757'/7'/0/0]025b2c58cbf22ad02e`)
    ).toEqual(7);
  });

  test('that account zero resolves to zero under both schemes', () => {
    expect(extractStacksDerivationPathAccountIndex(`m/44'/5757'/0'/0/0`)).toEqual(0);
  });
});

describe(stacksDerivationPathTypeFromPath.name, () => {
  test('that it classifies stacks standard paths', () => {
    expect(stacksDerivationPathTypeFromPath(`m/44'/5757'/0'/0/2`)).toEqual('stacks');
  });

  test('that it classifies ledger live paths', () => {
    expect(stacksDerivationPathTypeFromPath(`m/44'/5757'/2'/0/0`)).toEqual('ledgerLive');
  });

  test('that account zero is ambiguous', () => {
    expect(stacksDerivationPathTypeFromPath(`m/44'/5757'/0'/0/0`)).toBeNull();
  });
});

describe(inferStacksDerivationPathType.name, () => {
  const stacksDescriptors = [
    `[24682ead/44'/5757'/0'/0/0]025b2c58`,
    `[24682ead/44'/5757'/0'/0/1]03a1b2c3`,
  ];
  const ledgerLiveDescriptors = [
    `[24682ead/44'/5757'/0'/0/0]025b2c58`,
    `[24682ead/44'/5757'/1'/0/0]03d4e5f6`,
  ];

  test('that it infers the stacks standard', () => {
    expect(inferStacksDerivationPathType(stacksDescriptors)).toEqual('stacks');
  });

  test('that it infers the ledger live scheme', () => {
    expect(inferStacksDerivationPathType(ledgerLiveDescriptors)).toEqual('ledgerLive');
  });

  test('that account zero alone is ambiguous', () => {
    expect(inferStacksDerivationPathType([`[24682ead/44'/5757'/0'/0/0]025b2c58`])).toBeNull();
  });

  test('that it returns null for no descriptors', () => {
    expect(inferStacksDerivationPathType([])).toBeNull();
  });

  test('that mixed descriptors resolve to the stacks standard', () => {
    expect(inferStacksDerivationPathType([...ledgerLiveDescriptors, ...stacksDescriptors])).toEqual(
      'stacks'
    );
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

  test('it derives descriptor with unpadded fingerprint', () => {
    const descriptor = stacksRootKeychainToAccountDescriptor(
      testMnemonicKeychainWithLeadingZeros,
      0
    );
    expect(descriptor).toEqual(
      "[f25e8/44'/5757'/0'/0/0]02ffb37e6635be77b666f94204b20149ff91c7bea3502610d22645b8e0f334efc5"
    );
  });
});

describe(stacksRootKeychainToAccountDescriptorV2.name, () => {
  test('it derives the correct descriptor', () => {
    const descriptor = stacksRootKeychainToAccountDescriptorV2(
      testMnemonicKeychainWithLeadingZeros,
      0
    );

    expect(descriptor).toEqual(
      "[000f25e8/44'/5757'/0'/0/0]02ffb37e6635be77b666f94204b20149ff91c7bea3502610d22645b8e0f334efc5"
    );
  });
});

describe(getStacksBurnAddress.name, () => {
  it('should return the correct burn address for Mainnet', () => {
    const result = getStacksBurnAddress(ChainId.Mainnet);
    expect(result).toBe('SP00000000000003SCNSJTCSE62ZF4MSE');
  });

  it('should return the correct burn address for Testnet', () => {
    const result = getStacksBurnAddress(ChainId.Testnet);
    expect(result).toBe('ST000000000000000000002AMW42H');
  });

  it('should return the Testnet address for an unknown chainId', () => {
    const result = getStacksBurnAddress(9999 as ChainId); // Simulate an unknown chainId
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

describe(getStacksAssetStringParts.name, () => {
  test('should return parts of a fully qualified name', () => {
    const result = getStacksAssetStringParts('SP1234.contract-name::asset-name');
    expect(result).toEqual({
      contractAddress: 'SP1234',
      contractAssetName: 'asset-name',
      contractName: 'contract-name',
    });
  });

  test('should return parts of a fully qualified name (no asset name)', () => {
    const result = getStacksAssetStringParts('SP1234.contract-name');
    expect(result).toEqual({
      contractAddress: 'SP1234',
      contractAssetName: 'SP1234.contract-name',
      contractName: 'contract-name',
    });
  });

  test('should return the same string for all parts if it does not contain . or ::', () => {
    const result = getStacksAssetStringParts('contract-name');
    expect(result).toEqual({
      contractAddress: 'contract-name',
      contractAssetName: 'contract-name',
      contractName: 'contract-name',
    });
  });
});
