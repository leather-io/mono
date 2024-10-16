import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import { AddressBalanceResponse } from '../hiro-api-types';
import { createStxMoney } from './create-stx-money';

const mockedResponse: AddressBalanceResponse = {
  stx: {
    balance: '1000000',
    total_sent: '500000',
    total_received: '1500000',
    locked: '100000',
    total_fees_sent: '0',
    total_miner_rewards_received: '0',
    lock_tx_id: '',
    lock_height: 0,
    burnchain_lock_height: 0,
    burnchain_unlock_height: 0,
  },
  fungible_tokens: {},
  non_fungible_tokens: {},
};

describe('createStxMoney', () => {
  it('should create STX money object from AddressBalanceResponse', () => {
    const mockResponse: AddressBalanceResponse = {
      ...mockedResponse,
    };

    const result = createStxMoney(mockResponse);

    expect(result).toEqual({
      balance: { amount: new BigNumber('1000000'), symbol: 'STX' },
      total_sent: { amount: new BigNumber('500000'), symbol: 'STX' },
      total_received: { amount: new BigNumber('1500000'), symbol: 'STX' },
      locked: { amount: new BigNumber('100000'), symbol: 'STX' },
      total_fees_sent: { amount: new BigNumber('0'), symbol: 'STX' },
      total_miner_rewards_received: { amount: new BigNumber('0'), symbol: 'STX' },
    });
  });

  it('should handle zero balances', () => {
    const mockResponse: AddressBalanceResponse = {
      ...mockedResponse,
      stx: {
        ...mockedResponse.stx,
        balance: '0',
        total_sent: '0',
        total_received: '0',
        locked: '0',
      },
    };

    const result = createStxMoney(mockResponse);

    expect(result).toEqual({
      total_fees_sent: { amount: new BigNumber('0'), symbol: 'STX' },
      total_miner_rewards_received: { amount: new BigNumber('0'), symbol: 'STX' },
      balance: { amount: new BigNumber('0'), symbol: 'STX' },
      total_sent: { amount: new BigNumber('0'), symbol: 'STX' },
      total_received: { amount: new BigNumber('0'), symbol: 'STX' },
      locked: { amount: new BigNumber('0'), symbol: 'STX' },
    });
  });

  it('should handle large numbers', () => {
    const mockResponse: AddressBalanceResponse = {
      ...mockedResponse,
      stx: {
        ...mockedResponse.stx,
        balance: '9007199254740991', // Max safe integer in JavaScript
        total_sent: '18014398509481982',
        total_received: '27021597764222973',
        locked: '1000000000000000',
      },
    };

    const result = createStxMoney(mockResponse);

    expect(result).toEqual({
      total_fees_sent: { amount: new BigNumber('0'), symbol: 'STX' },
      total_miner_rewards_received: { amount: new BigNumber('0'), symbol: 'STX' },
      balance: { amount: new BigNumber('9007199254740991'), symbol: 'STX' },
      total_sent: { amount: new BigNumber('18014398509481982'), symbol: 'STX' },
      total_received: { amount: new BigNumber('27021597764222973'), symbol: 'STX' },
      locked: { amount: new BigNumber('1000000000000000'), symbol: 'STX' },
    });
  });
});
