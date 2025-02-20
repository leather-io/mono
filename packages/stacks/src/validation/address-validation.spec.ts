import { ChainId } from '@leather.io/models';

import {
  TEST_ACCOUNT_1_STX_ADDRESS,
  TEST_ACCOUNT_2_STX_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_STX_ADDRESS,
} from '../mocks/mocks';
import {
  isValidAddressChain,
  isValidStacksAddress,
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
