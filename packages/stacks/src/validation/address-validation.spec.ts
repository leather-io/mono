import { ChainId } from '@leather.io/models';

import {
  TEST_ACCOUNT_1_STX_ADDRESS,
  TEST_ACCOUNT_2_STX_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_STX_ADDRESS,
} from '../mocks/mocks';
import {
  contractPrincipalSchema,
  isValidAddressChain,
  isValidStacksAddress,
  principalSchema,
  standardPrincipalSchema,
  validatePayerNotRecipient,
} from './address-validation';

describe('isValidStacksAddress', () => {
  it('returns false for undefined address', () => {
    // @ts-expect-error undefined address
    expect(isValidStacksAddress(undefined)).toBe(false);
  });

  it('returns false for empty string address', () => {
    expect(isValidStacksAddress('')).toBe(false);
  });

  it('returns true for valid stacks address', () => {
    expect(isValidStacksAddress(TEST_ACCOUNT_1_STX_ADDRESS)).toBe(true);
  });

  it('returns false for invalid stacks address', () => {
    expect(isValidStacksAddress('InvalidAddress')).toBe(false);
  });
});

describe('isValidAddressChain', () => {
  it('returns false for undefined address', () => {
    // @ts-expect-error undefined address
    expect(isValidAddressChain(undefined, ChainId.Mainnet)).toBe(false);
  });

  it('returns false for empty string address', () => {
    expect(isValidAddressChain('', ChainId.Mainnet)).toBe(false);
  });

  it('returns true for valid mainnet address', () => {
    expect(isValidAddressChain(TEST_ACCOUNT_1_STX_ADDRESS, ChainId.Mainnet)).toBe(true);
    expect(isValidAddressChain(TEST_ACCOUNT_2_STX_ADDRESS, ChainId.Mainnet)).toBe(true);
  });

  it('returns true for valid testnet address', () => {
    expect(isValidAddressChain(TEST_TESTNET_ACCOUNT_2_STX_ADDRESS, ChainId.Testnet)).toBe(true);
  });

  it('returns false for invalid mainnet address', () => {
    expect(isValidAddressChain('InvalidAddress', ChainId.Mainnet)).toBe(false);
  });

  it('returns false for invalid testnet address', () => {
    expect(isValidAddressChain('InvalidAddress', ChainId.Testnet)).toBe(false);
  });

  it('returns false for mainnet address on testnet', () => {
    expect(isValidAddressChain(TEST_ACCOUNT_1_STX_ADDRESS, ChainId.Testnet)).toBe(false);
    expect(isValidAddressChain(TEST_ACCOUNT_2_STX_ADDRESS, ChainId.Testnet)).toBe(false);
  });

  it('returns false for testnet address on mainnet', () => {
    expect(isValidAddressChain(TEST_TESTNET_ACCOUNT_2_STX_ADDRESS, ChainId.Mainnet)).toBe(false);
  });
});

describe('validatePayerNotRecipient', () => {
  it('returns false for undefined senderAddress', () => {
    // @ts-expect-error undefined senderAddress
    expect(validatePayerNotRecipient(undefined, TEST_ACCOUNT_1_STX_ADDRESS)).toBe(false);
  });

  it('returns false for undefined recipientAddress', () => {
    // @ts-expect-error undefined recipientAddress
    expect(validatePayerNotRecipient(TEST_ACCOUNT_1_STX_ADDRESS, undefined)).toBe(false);
  });

  it('returns false for empty string senderAddress', () => {
    expect(validatePayerNotRecipient('', TEST_ACCOUNT_1_STX_ADDRESS)).toBe(false);
  });

  it('returns false for empty string recipientAddress', () => {
    expect(validatePayerNotRecipient(TEST_ACCOUNT_1_STX_ADDRESS, '')).toBe(false);
  });

  it('returns false for same sender and recipient addresses', () => {
    expect(validatePayerNotRecipient(TEST_ACCOUNT_1_STX_ADDRESS, TEST_ACCOUNT_1_STX_ADDRESS)).toBe(
      false
    );
  });

  it('returns true for different sender and recipient addresses', () => {
    expect(validatePayerNotRecipient(TEST_ACCOUNT_1_STX_ADDRESS, TEST_ACCOUNT_2_STX_ADDRESS)).toBe(
      true
    );
  });
});

describe('standardPrincipalSchema', () => {
  it('should accept valid standard principal addresses', () => {
    expect(standardPrincipalSchema.safeParse(TEST_ACCOUNT_1_STX_ADDRESS)).toEqual({
      success: true,
      data: TEST_ACCOUNT_1_STX_ADDRESS,
    });
    expect(standardPrincipalSchema.safeParse(TEST_ACCOUNT_2_STX_ADDRESS)).toEqual({
      success: true,
      data: TEST_ACCOUNT_2_STX_ADDRESS,
    });
  });

  it('should reject invalid addresses', () => {
    const result = standardPrincipalSchema.safeParse('InvalidAddress');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid standard Stacks principal address');
    }
  });

  it('should reject contract principals (addresses with dots)', () => {
    const result = standardPrincipalSchema.safeParse(`${TEST_ACCOUNT_1_STX_ADDRESS}.contract-name`);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid standard Stacks principal address');
    }
  });

  it('should reject non-string inputs', () => {
    const result = standardPrincipalSchema.safeParse(123);
    expect(result.success).toBe(false);
  });

  it('should reject empty strings', () => {
    const result = standardPrincipalSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('contractPrincipalSchema', () => {
  it('should accept valid contract principals', () => {
    const contractPrincipal = `${TEST_ACCOUNT_1_STX_ADDRESS}.my-contract`;
    expect(contractPrincipalSchema.safeParse(contractPrincipal)).toEqual({
      success: true,
      data: contractPrincipal,
    });
  });

  it('should accept contract names with valid characters', () => {
    const validNames = ['contract-name', 'contract_name', 'contract123', 'my-contract_v2'];

    for (const name of validNames) {
      const contractPrincipal = `${TEST_ACCOUNT_1_STX_ADDRESS}.${name}`;
      const result = contractPrincipalSchema.safeParse(contractPrincipal);
      expect(result.success).toBe(true);
    }
  });

  it('should reject contract principals without dots', () => {
    const result = contractPrincipalSchema.safeParse(TEST_ACCOUNT_1_STX_ADDRESS);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Invalid contract principal (must be address.contract-name format)'
      );
    }
  });

  it('should reject contract principals with multiple dots', () => {
    const result = contractPrincipalSchema.safeParse(
      `${TEST_ACCOUNT_1_STX_ADDRESS}.contract.extra`
    );
    expect(result.success).toBe(false);
  });

  it('should reject contract principals with invalid address part', () => {
    const result = contractPrincipalSchema.safeParse('InvalidAddress.contract-name');
    expect(result.success).toBe(false);
  });

  it('should reject contract names with invalid characters', () => {
    const invalidNames = ['contract@name', 'contract.name', 'contract name', 'contract!', ''];

    for (const name of invalidNames) {
      const contractPrincipal = `${TEST_ACCOUNT_1_STX_ADDRESS}.${name}`;
      const result = contractPrincipalSchema.safeParse(contractPrincipal);
      expect(result.success).toBe(false);
    }
  });

  it('should reject contract names longer than 128 characters', () => {
    const longName = 'a'.repeat(129);
    const contractPrincipal = `${TEST_ACCOUNT_1_STX_ADDRESS}.${longName}`;
    const result = contractPrincipalSchema.safeParse(contractPrincipal);
    expect(result.success).toBe(false);
  });

  it('should accept contract names exactly 128 characters long', () => {
    const maxName = 'a'.repeat(128);
    const contractPrincipal = `${TEST_ACCOUNT_1_STX_ADDRESS}.${maxName}`;
    const result = contractPrincipalSchema.safeParse(contractPrincipal);
    expect(result.success).toBe(true);
  });

  it('should reject non-string inputs', () => {
    const result = contractPrincipalSchema.safeParse(123);
    expect(result.success).toBe(false);
  });
});

describe('principalSchema', () => {
  it('should accept valid standard principals', () => {
    expect(principalSchema.safeParse(TEST_ACCOUNT_1_STX_ADDRESS)).toEqual({
      success: true,
      data: TEST_ACCOUNT_1_STX_ADDRESS,
    });
  });

  it('should accept valid contract principals', () => {
    const contractPrincipal = `${TEST_ACCOUNT_1_STX_ADDRESS}.my-contract`;
    expect(principalSchema.safeParse(contractPrincipal)).toEqual({
      success: true,
      data: contractPrincipal,
    });
  });

  it('should reject invalid addresses', () => {
    const result = principalSchema.safeParse('InvalidAddress');
    expect(result.success).toBe(false);
  });

  it('should reject invalid contract principals', () => {
    const result = principalSchema.safeParse('InvalidAddress.contract');
    expect(result.success).toBe(false);
  });

  it('should reject non-string inputs', () => {
    const result = principalSchema.safeParse(123);
    expect(result.success).toBe(false);
  });

  it('should reject empty strings', () => {
    const result = principalSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});
