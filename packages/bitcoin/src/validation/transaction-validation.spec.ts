import BigNumber from 'bignumber.js';

import { BitcoinNetworkModes } from '@leather.io/models';

import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  inValidCharactersAddress,
} from '../mocks/mocks';
import { BitcoinError } from '../validation/bitcoin-error';
import { isValidBitcoinTransaction } from './transaction-validation';

const mockTransaction = {
  amount: 1,
  payer: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  recipient: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  network: 'testnet' as BitcoinNetworkModes,
  utxos: [],
  feeRate: 1,
  feeRates: {
    fastestFee: new BigNumber(3),
    halfHourFee: new BigNumber(2),
    hourFee: new BigNumber(1),
  },
};

describe('isValidBitcoinTransaction', () => {
  it('should throw an error if the payer address is invalid', () => {
    const transaction = {
      ...mockTransaction,
      payer: inValidCharactersAddress,
    };
    expect(() => isValidBitcoinTransaction(transaction)).toThrow(BitcoinError);
  });

  it('should throw an error if the recipient address is invalid', () => {
    const transaction = {
      ...mockTransaction,
      recipient: inValidCharactersAddress,
    };
    expect(() => isValidBitcoinTransaction(transaction)).toThrow(BitcoinError);
  });

  it('should throw an error if the amount is insufficient', () => {
    const transaction = {
      ...mockTransaction,
      amount: 0,
    };
    expect(() => isValidBitcoinTransaction(transaction)).toThrow(BitcoinError);
  });

  it('should throw an error if the balance is insufficient', () => {
    const transaction = {
      ...mockTransaction,
      amount: 200,
    };
    expect(() => isValidBitcoinTransaction(transaction)).toThrow(BitcoinError);
  });
});
