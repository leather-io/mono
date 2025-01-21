import { ChainId } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { TEST_ACCOUNT_1_STX_ADDRESS, TEST_ACCOUNT_2_STX_ADDRESS } from '../mocks/mocks';
import { StacksError } from './stacks-error';
import { isValidStacksTransaction } from './transaction-validation';

const InvalidAddress = 'InvalidAddress';

const mockTransaction = {
  amount: createMoney(1, 'STX'),
  payer: TEST_ACCOUNT_1_STX_ADDRESS,
  recipient: TEST_ACCOUNT_2_STX_ADDRESS,
  chainId: ChainId.Mainnet,
  availableBalance: createMoney(100, 'STX'),
  fee: createMoney(1, 'STX'),
};
describe('isValidStacksTransaction', () => {
  it('throws an error for unknown balance', () => {
    const transaction = {
      ...mockTransaction,
      availableBalance: null,
    };
    // @ts-expect-error - availableBalance is null
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('UnknownBalance')
    );
  });

  it('throws an error for invalid amount', () => {
    const transaction = {
      ...mockTransaction,
      amount: 'invalid_amount',
    };
    // @ts-expect-error - amount is a string
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('InvalidAmount')
    );
  });

  it('throws an error for unknown fee', () => {
    const transaction = {
      ...mockTransaction,
      fee: null,
    };
    // @ts-expect-error - fee is null
    expect(() => isValidStacksTransaction(transaction)).toThrowError(new StacksError('UnknownFee'));
  });

  it('throws an error for insufficient funds', () => {
    const transaction = {
      ...mockTransaction,
      availableBalance: createMoney(0.5, 'STX'),
    };
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('InsufficientFunds')
    );
  });

  it('throws an error for invalid transaction', () => {
    const transaction = {
      ...mockTransaction,
      amount: 'invalid_amount',
    };
    // @ts-expect-error - amount is a string
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('InvalidAmount')
    );
  });
  it('throws an error for invalid sender address', () => {
    const transaction = {
      ...mockTransaction,
      payer: InvalidAddress,
    };
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('InvalidAddress')
    );
  });

  it('throws an error for invalid recipient address', () => {
    const transaction = {
      ...mockTransaction,
      recipient: InvalidAddress,
    };
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('InvalidAddress')
    );
  });

  it('throws an error for invalid network address', () => {
    const transaction = {
      ...mockTransaction,
      chainId: ChainId.Testnet,
    };
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('InvalidNetworkAddress')
    );
  });

  it('throws an error for invalid network address for same recipients', () => {
    const transaction = {
      ...mockTransaction,
      chainId: ChainId.Testnet,
      recipient: TEST_ACCOUNT_1_STX_ADDRESS,
    };
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('InvalidNetworkAddress')
    );
  });

  it('throws an error for same sender and recipient addresses', () => {
    const transaction = {
      ...mockTransaction,
      recipient: TEST_ACCOUNT_1_STX_ADDRESS,
    };
    expect(() => isValidStacksTransaction(transaction)).toThrowError(
      new StacksError('InvalidSameAddress')
    );
  });

  it('does not throw an error for valid transaction', () => {
    expect(() => isValidStacksTransaction(mockTransaction)).not.toThrow();
  });
});
