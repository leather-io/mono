import BigNumber from 'bignumber.js';

import { BitcoinNetworkModes } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS,
  inValidCharactersAddress,
} from '../mocks/mocks';
import { BitcoinError } from '../validation/bitcoin-error';
import { isValidBitcoinTransaction } from './transaction-validation';

const mockTransaction = {
  amount: createMoney(1, 'BTC'),
  payer: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  recipient: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  network: 'testnet' as BitcoinNetworkModes,
  utxos: [
    {
      address: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
      txid: '75cdc9faeb938b917026108c0ed71d108d4e7cb8ee3c69cfb85a5929b77dd8cf',
      value: 62316,
      vout: 0,
    },
    {
      address: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
      txid: '431791693a9f95592808b29e9de19566486fa2fe373c38786bf6be3ca10e1d04',
      value: 16778,
      vout: 1,
    },
  ],
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
      amount: createMoney(0, 'BTC'),
    };
    expect(() => isValidBitcoinTransaction(transaction)).toThrow(BitcoinError);
  });

  it('should throw an error if the balance is insufficient', () => {
    const transaction = {
      ...mockTransaction,
      amount: createMoney(200, 'BTC'),
    };
    expect(() => isValidBitcoinTransaction(transaction)).toThrow(BitcoinError);
  });

  it('should throw an error if the amount precision is invalid', () => {
    const transaction = {
      ...mockTransaction,
      amount: createMoney(1.123456789, 'BTC'),
    };
    expect(() => isValidBitcoinTransaction(transaction)).toThrow(BitcoinError);
  });

  it('should not throw an error if the network is incorrect', () => {
    expect(() => isValidBitcoinTransaction(mockTransaction)).toThrow(BitcoinError);
  });

  it('should not throw an error if the amount precision is valid', () => {
    const transaction = {
      ...mockTransaction,
      payer: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
      recipient: TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS,
      amount: createMoney(new BigNumber(546), 'BTC'),
    };
    expect(() => isValidBitcoinTransaction(transaction)).not.toThrow(BitcoinError);
  });
});
