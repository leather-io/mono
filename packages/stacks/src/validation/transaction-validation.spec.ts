import { ChainId } from '@leather.io/models';

import {
  TEST_ACCOUNT_1_STX_ADDRESS,
  TEST_ACCOUNT_1_STX_ADDRESS_SM,
  TEST_TESTNET_ACCOUNT_2_STX_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_STX_ADDRESS_SN,
} from '../mocks/mocks';
import { StacksError } from './stacks-error';
import { isValidStacksTransaction } from './transaction-validation';

const InvalidAddress = 'InvalidAddress';

describe('isValidStacksTransaction', () => {
  it('throws an error for invalid sender address', () => {
    expect(() =>
      isValidStacksTransaction(InvalidAddress, TEST_ACCOUNT_1_STX_ADDRESS, ChainId.Mainnet)
    ).toThrowError(new StacksError('InvalidAddress'));
  });

  it('throws an error for invalid recipient address', () => {
    expect(() =>
      isValidStacksTransaction(TEST_ACCOUNT_1_STX_ADDRESS, InvalidAddress, ChainId.Mainnet)
    ).toThrowError(new StacksError('InvalidAddress'));
  });

  it('throws an error for invalid network address', () => {
    expect(() =>
      isValidStacksTransaction(
        TEST_ACCOUNT_1_STX_ADDRESS,
        TEST_ACCOUNT_1_STX_ADDRESS_SM,
        ChainId.Testnet
      )
    ).toThrowError(new StacksError('InvalidNetworkAddress'));
  });

  it('throws an error for same sender and recipient addresses', () => {
    expect(() =>
      isValidStacksTransaction(
        TEST_TESTNET_ACCOUNT_2_STX_ADDRESS,
        TEST_TESTNET_ACCOUNT_2_STX_ADDRESS_SN,
        ChainId.Mainnet
      )
    ).toThrowError(new StacksError('InvalidSameAddress'));
  });

  it('does not throw an error for valid transaction', () => {
    expect(() =>
      isValidStacksTransaction(
        TEST_ACCOUNT_1_STX_ADDRESS,
        TEST_ACCOUNT_1_STX_ADDRESS_SM,
        ChainId.Mainnet
      )
    ).not.toThrow();
  });
});
