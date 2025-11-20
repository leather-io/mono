import { describe, expect, it } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type {
  Money,
  ReceiveAssetActivity,
  SendAssetActivity,
  SwapAssetsActivity,
} from '@leather.io/models';
import { createMoney, initBigNumber, minusSign } from '@leather.io/utils';

import {
  getActivityBalances,
  getBalanceColor,
  getBalanceOperator,
  getBalancesText,
} from './activity-balance';

function mockFormatMoney(money: Money): string {
  return `${money.amount.toNumber().toLocaleString('en-US')}\u00A0${money.symbol}`;
}

const baseActivity = {
  level: 'account' as const,
  account: {
    fingerprint: 'test-fingerprint',
    accountIndex: 0,
  },
  timestamp: 0,
  txid: 'txid',
};

describe('activity-balance', () => {
  describe('getBalanceOperator', () => {
    it('returns + for receiveAsset activity', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        type: 'receiveAsset',
        status: 'success',
        asset: btcAsset,
        senders: ['sender-address'],
        amount: initBigNumber(1),
      };
      expect(getBalanceOperator(activity)).toBe('+');
    });

    it('returns minus sign for sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(getBalanceOperator(activity)).toBe(minusSign);
    });

    it('returns undefined for other activity types', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(getBalanceOperator(activity as any)).toBeUndefined();
    });
  });

  describe('getBalanceColor', () => {
    it('returns green for successful receiveAsset activity', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        type: 'receiveAsset',
        status: 'success',
        asset: btcAsset,
        senders: ['sender-address'],
        amount: initBigNumber(1),
      };
      expect(getBalanceColor(activity)).toBe('green.action-primary-default');
    });

    it('returns default color for pending receiveAsset activity', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        type: 'receiveAsset',
        status: 'pending',
        asset: btcAsset,
        senders: ['sender-address'],
        amount: initBigNumber(1),
      };
      expect(getBalanceColor(activity)).toBe('ink.text-primary');
    });

    it('returns default color for sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(getBalanceColor(activity)).toBe('ink.text-primary');
    });

    it('returns default color for activity without status', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(getBalanceColor(activity as any)).toBe('ink.text-primary');
    });
  });

  describe('getBalancesText', () => {
    it('formats balances for receiveAsset activity with operator', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        type: 'receiveAsset',
        status: 'success',
        asset: btcAsset,
        senders: ['sender-address'],
        amount: initBigNumber(1),
        value: {
          crypto: createMoney(1, 'BTC'),
          quote: createMoney(50000, 'USD'),
        },
      };

      const result = getBalancesText(activity, mockFormatMoney);
      expect(result.formattedBalanceCrypto).toBe('+ 1\u00A0BTC');
      expect(result.formattedBalanceQuote).toBe('+ 50,000\u00A0USD');
    });

    it('formats balances for sendAsset activity with minus operator', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(0.5),
        value: {
          crypto: createMoney(0.5, 'BTC'),
          quote: createMoney(25000, 'USD'),
        },
      };

      const result = getBalancesText(activity, mockFormatMoney);
      expect(result.formattedBalanceCrypto).toBe(`${minusSign} 0.5\u00A0BTC`);
      expect(result.formattedBalanceQuote).toBe(`${minusSign} 25,000\u00A0USD`);
    });

    it('formats balances for swapAssets activity using toValue', () => {
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        type: 'swapAssets',
        status: 'success',
        fromAsset: btcAsset,
        fromAmount: initBigNumber(1),
        toAsset: stxAsset,
        toAmount: initBigNumber(2),
        toValue: {
          crypto: createMoney(2, 'STX'),
          quote: createMoney(1000, 'USD'),
        },
      };

      const result = getBalancesText(activity, mockFormatMoney);
      expect(result.formattedBalanceCrypto).toBe('+ 2\u00A0STX');
      expect(result.formattedBalanceQuote).toBe('+ 1,000\u00A0USD');
    });

    it('returns empty strings for activity without value', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };

      const result = getBalancesText(activity as any, mockFormatMoney);
      expect(result.formattedBalanceCrypto).toBe('');
      expect(result.formattedBalanceQuote).toBe('');
    });

    it('handles activity without value property', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };

      const result = getBalancesText(activity, mockFormatMoney);
      expect(result.formattedBalanceCrypto).toBe('');
      expect(result.formattedBalanceQuote).toBe('');
    });
  });

  describe('getActivityBalances', () => {
    it('returns balances object for receiveAsset activity', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        type: 'receiveAsset',
        status: 'success',
        asset: btcAsset,
        senders: ['sender-address'],
        amount: initBigNumber(1),
        value: {
          crypto: createMoney(1, 'BTC'),
          quote: createMoney(50000, 'USD'),
        },
      };

      const result = getActivityBalances(activity);
      expect(result).toEqual({
        operator: '+',
        crypto: activity.value?.crypto,
        quote: activity.value?.quote,
        color: 'green.action-primary-default',
      });
    });

    it('returns balances object for sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(0.5),
        value: {
          crypto: createMoney(0.5, 'BTC'),
          quote: createMoney(25000, 'USD'),
        },
      };

      const result = getActivityBalances(activity);
      expect(result).toEqual({
        operator: minusSign,
        crypto: activity.value?.crypto,
        quote: activity.value?.quote,
        color: 'ink.text-primary',
      });
    });

    it('returns balances object for swapAssets activity using toValue', () => {
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        type: 'swapAssets',
        status: 'success',
        fromAsset: btcAsset,
        fromAmount: initBigNumber(1),
        toAsset: stxAsset,
        toAmount: initBigNumber(2),
        toValue: {
          crypto: createMoney(2, 'STX'),
          quote: createMoney(1000, 'USD'),
        },
      };

      const result = getActivityBalances(activity);
      expect(result).toEqual({
        operator: '+',
        crypto: activity.toValue?.crypto,
        quote: activity.toValue?.quote,
        color: 'ink.text-primary',
      });
    });

    it('returns empty object for activity without value', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };

      const result = getActivityBalances(activity as any);
      expect(result).toEqual({});
    });
  });
});
