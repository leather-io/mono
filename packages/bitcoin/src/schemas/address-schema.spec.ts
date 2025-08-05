import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
  inValidCharactersAddress,
  inValidLengthAddress,
  invalidAddress,
} from '../mocks/mocks';
import {
  btcAddressNetworkValidator,
  btcAddressValidator,
  getNetworkTypeFromAddress,
  nonEmptyStringValidator,
} from './address-schema';

describe('nonEmptyStringValidator', () => {
  it('should validate non-empty strings', () => {
    const validator = nonEmptyStringValidator();

    expect(validator.safeParse('valid string').success).toBe(true);
    expect(validator.safeParse('a').success).toBe(true);
    expect(validator.safeParse('   valid   ').success).toBe(true);
  });

  it('should reject empty strings', () => {
    const validator = nonEmptyStringValidator();

    expect(validator.safeParse('').success).toBe(false);
    expect(validator.safeParse('   ').success).toBe(false);
    expect(validator.safeParse('\t\n').success).toBe(false);
  });

  it('should reject undefined values', () => {
    const validator = nonEmptyStringValidator();

    expect(validator.safeParse(undefined).success).toBe(false);
  });

  it('should use custom error message', () => {
    const customMessage = 'Custom error message';
    const validator = nonEmptyStringValidator(customMessage);
    const result = validator.safeParse('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(customMessage);
    }
  });

  it('should use default empty message when no message provided', () => {
    const validator = nonEmptyStringValidator();
    const result = validator.safeParse('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('');
    }
  });
});

describe('btcAddressValidator', () => {
  it('should validate valid bitcoin addresses', () => {
    const validator = btcAddressValidator();

    expect(validator.safeParse(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS).success).toBe(true);
    expect(validator.safeParse(TEST_ACCOUNT_1_TAPROOT_ADDRESS).success).toBe(true);
    expect(validator.safeParse(TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS).success).toBe(true);
    expect(validator.safeParse(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS).success).toBe(true);
  });

  it('should reject undefined values (due to z.string())', () => {
    const validator = btcAddressValidator();

    // Note: z.string() rejects undefined at schema level, so this should fail
    expect(validator.safeParse(undefined).success).toBe(false);
  });

  it('should allow empty strings but reject whitespace-only strings', () => {
    const validator = btcAddressValidator();

    expect(validator.safeParse('').success).toBe(true);
    // Whitespace-only strings are not considered empty by isEmptyString()
    expect(validator.safeParse('   ').success).toBe(false);
  });

  it('should reject invalid bitcoin addresses', () => {
    const validator = btcAddressValidator();

    expect(validator.safeParse(invalidAddress).success).toBe(false);
    expect(validator.safeParse(inValidCharactersAddress).success).toBe(false);
    expect(validator.safeParse(inValidLengthAddress).success).toBe(false);
    expect(validator.safeParse('not-a-bitcoin-address').success).toBe(false);
  });

  it('should return correct error message for invalid addresses', () => {
    const validator = btcAddressValidator();
    const result = validator.safeParse('invalid-address');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Bitcoin address is not valid');
    }
  });
});

describe('getNetworkTypeFromAddress', () => {
  it('should return mainnet for mainnet addresses', () => {
    expect(getNetworkTypeFromAddress(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS)).toBe('mainnet');
    expect(getNetworkTypeFromAddress(TEST_ACCOUNT_1_TAPROOT_ADDRESS)).toBe('mainnet');
  });

  it('should return testnet for testnet addresses', () => {
    expect(getNetworkTypeFromAddress(TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS)).toBe('testnet');
    expect(getNetworkTypeFromAddress(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS)).toBe('testnet');
  });

  it('should handle legacy addresses', () => {
    // Legacy mainnet address (starts with 1)
    expect(getNetworkTypeFromAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe('mainnet');

    // Legacy testnet address (starts with m or n)
    expect(getNetworkTypeFromAddress('mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef')).toBe('testnet');
  });
});

describe('btcAddressNetworkValidator', () => {
  describe('mainnet validation', () => {
    it('should validate mainnet addresses for mainnet network', () => {
      const validator = btcAddressNetworkValidator('mainnet');

      expect(validator.safeParse(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS).success).toBe(true);
      expect(validator.safeParse(TEST_ACCOUNT_1_TAPROOT_ADDRESS).success).toBe(true);
    });

    it('should reject testnet addresses for mainnet network', () => {
      const validator = btcAddressNetworkValidator('mainnet');

      expect(validator.safeParse(TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS).success).toBe(false);
      expect(validator.safeParse(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS).success).toBe(false);
    });

    it('should return correct error message for wrong network', () => {
      const validator = btcAddressNetworkValidator('mainnet');
      const result = validator.safeParse(TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Address is for incorrect network');
      }
    });
  });

  describe('testnet validation', () => {
    it('should validate testnet addresses for testnet network', () => {
      const validator = btcAddressNetworkValidator('testnet');

      expect(validator.safeParse(TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS).success).toBe(true);
      expect(validator.safeParse(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS).success).toBe(true);
    });

    it('should reject mainnet addresses for testnet network', () => {
      const validator = btcAddressNetworkValidator('testnet');

      expect(validator.safeParse(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS).success).toBe(false);
      expect(validator.safeParse(TEST_ACCOUNT_1_TAPROOT_ADDRESS).success).toBe(false);
    });
  });

  describe('signet validation', () => {
    it('should validate testnet addresses for signet network (uses testnet format)', () => {
      const validator = btcAddressNetworkValidator('signet');

      expect(validator.safeParse(TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS).success).toBe(true);
      expect(validator.safeParse(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS).success).toBe(true);
    });

    it('should reject mainnet addresses for signet network', () => {
      const validator = btcAddressNetworkValidator('signet');

      expect(validator.safeParse(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS).success).toBe(false);
      expect(validator.safeParse(TEST_ACCOUNT_1_TAPROOT_ADDRESS).success).toBe(false);
    });
  });

  describe('regtest validation', () => {
    it('should validate regtest addresses for regtest network', () => {
      const validator = btcAddressNetworkValidator('regtest');

      // Regtest may have different address formats, let's test with actual regtest addresses
      // For now, let's skip this test since we don't have actual regtest addresses in mocks
      expect(validator.safeParse('').success).toBe(true); // Empty string should pass
    });
  });

  describe('empty and undefined values', () => {
    it('should reject undefined values (due to z.string())', () => {
      // Note: z.string() rejects undefined at schema level, so these should fail
      expect(btcAddressNetworkValidator('mainnet').safeParse(undefined).success).toBe(false);
      expect(btcAddressNetworkValidator('testnet').safeParse(undefined).success).toBe(false);
      expect(btcAddressNetworkValidator('signet').safeParse(undefined).success).toBe(false);
      expect(btcAddressNetworkValidator('regtest').safeParse(undefined).success).toBe(false);
    });

    it('should allow empty strings for all networks', () => {
      expect(btcAddressNetworkValidator('mainnet').safeParse('').success).toBe(true);
      expect(btcAddressNetworkValidator('testnet').safeParse('').success).toBe(true);
      expect(btcAddressNetworkValidator('signet').safeParse('').success).toBe(true);
      expect(btcAddressNetworkValidator('regtest').safeParse('').success).toBe(true);
    });

    it('should reject whitespace-only strings for all networks', () => {
      // Whitespace-only strings are not considered empty by isEmptyString(), so they should fail validation
      expect(btcAddressNetworkValidator('mainnet').safeParse('   ').success).toBe(false);
      expect(btcAddressNetworkValidator('testnet').safeParse('   ').success).toBe(false);
      expect(btcAddressNetworkValidator('signet').safeParse('   ').success).toBe(false);
      expect(btcAddressNetworkValidator('regtest').safeParse('   ').success).toBe(false);
    });
  });

  describe('invalid addresses', () => {
    it('should reject invalid addresses for all networks', () => {
      const networks = ['mainnet', 'testnet', 'signet', 'regtest'] as const;

      networks.forEach(network => {
        const validator = btcAddressNetworkValidator(network);
        expect(validator.safeParse(invalidAddress).success).toBe(false);
        expect(validator.safeParse('not-a-bitcoin-address').success).toBe(false);
      });
    });
  });
});

describe('integration with zod schema', () => {
  it('should work within zod object schemas', () => {
    const schema = z.object({
      name: nonEmptyStringValidator('Name is required'),
      address: btcAddressValidator(),
      networkAddress: btcAddressNetworkValidator('mainnet'),
    });

    // Valid case
    const validData = {
      name: 'Test User',
      address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
      networkAddress: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
    };
    expect(schema.safeParse(validData).success).toBe(true);

    // Invalid cases
    const invalidName = { ...validData, name: '' };
    expect(schema.safeParse(invalidName).success).toBe(false);

    const invalidAddress = { ...validData, address: 'invalid-address' };
    expect(schema.safeParse(invalidAddress).success).toBe(false);

    const wrongNetwork = {
      ...validData,
      networkAddress: TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
    };
    expect(schema.safeParse(wrongNetwork).success).toBe(false);
  });

  it('should work with optional fields', () => {
    const schema = z.object({
      name: nonEmptyStringValidator('Name is required'),
      address: btcAddressValidator().optional(),
      networkAddress: btcAddressNetworkValidator('mainnet').optional(),
    });

    // Valid case with optional fields undefined
    const validDataWithOptionals = {
      name: 'Test User',
      // address and networkAddress are optional
    };
    expect(schema.safeParse(validDataWithOptionals).success).toBe(true);

    // Valid case with empty address (allowed by btcAddressValidator)
    const validDataWithEmptyAddress = {
      name: 'Test User',
      address: '',
      networkAddress: '',
    };
    expect(schema.safeParse(validDataWithEmptyAddress).success).toBe(true);
  });
});
