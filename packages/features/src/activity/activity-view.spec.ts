import { describe, expect, it } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  type ConnectAppActivity,
  type ReceiveAssetActivity,
  type SendAssetActivity,
  type SwapAssetsActivity,
  defaultCurrentNetwork,
} from '@leather.io/models';
import { createMoney, initBigNumber, minusSign } from '@leather.io/utils';

import { createActivityView } from './activity-view';

const baseActivity = {
  level: 'account' as const,
  account: {
    fingerprint: 'test-fingerprint',
    accountIndex: 0,
  },
  timestamp: 0,
  txid: 'txid-123',
};

describe('activity-view', () => {
  describe('createActivityView', () => {
    it('maps send activity with all metadata', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        status: 'success',
        type: 'sendAsset',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(0.0001),
        value: {
          crypto: createMoney(0.0001, 'BTC'),
          quote: createMoney(5, 'USD'),
        },
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.asset).toBe(btcAsset);
      expect(result.title).toBe('BTC');
      expect(result.statusLabel).toBe('Sent');
      expect(result.balances.operator).toBe(minusSign);
      expect(result.balances.crypto).toBe(activity.value?.crypto);
      expect(result.balances.quote).toBe(activity.value?.quote);
      expect(result.balances.color).toBe('ink.text-primary');
      expect(result.activityAvatar).toBe('asset');
      expect(result.statusIndicator).toBe('sent');
      expect(result.activityLink).toContain('/tx/');
      expect(result.key).toBeDefined();
    });

    it('maps receive activity with success color', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        status: 'success',
        type: 'receiveAsset',
        asset: stxAsset,
        senders: ['sender-address'],
        amount: initBigNumber(100),
        value: {
          crypto: createMoney(100, 'STX'),
          quote: createMoney(50, 'USD'),
        },
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.asset).toBe(stxAsset);
      expect(result.title).toBe('STX');
      expect(result.statusLabel).toBe('Received');
      expect(result.balances.operator).toBe('+');
      expect(result.balances.color).toBe('green.action-primary-default');
      expect(result.activityAvatar).toBe('asset');
      expect(result.statusIndicator).toBe('received');
    });

    it('maps swap activity with toAsset and swap avatar', () => {
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        status: 'success',
        type: 'swapAssets',
        fromAsset: btcAsset,
        fromAmount: initBigNumber(1),
        toAsset: stxAsset,
        toAmount: initBigNumber(2000),
        toValue: {
          crypto: createMoney(2000, 'STX'),
          quote: createMoney(1000, 'USD'),
        },
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.asset).toBe(stxAsset);
      expect(result.fromAsset).toBe(btcAsset);
      expect(result.toAsset).toBe(stxAsset);
      expect(result.title).toBe('fungible → STX');
      expect(result.statusLabel).toBe('BTC → STX');
      expect(result.balances.operator).toBe('+');
      expect(result.activityAvatar).toBe('swap');
      expect(result.statusIndicator).toBe('swap');
    });

    it('combines status label and caption', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        status: 'success',
        type: 'sendAsset',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
        timestamp: Math.floor(Date.now() / 1000) - 3600,
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.caption).toContain('Sent');
      expect(result.statusLabel).toBe('Sent');
    });

    it('sets activityLink to null when txid is missing', () => {
      const activity: ConnectAppActivity = {
        level: 'account' as const,
        account: {
          fingerprint: 'test-fingerprint',
          accountIndex: 0,
        },
        timestamp: 0,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.activityLink).toBeNull();
    });

    it('sets activityLink to null when asset is missing', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };

      const result = createActivityView(activity as any, defaultCurrentNetwork);

      expect(result.activityLink).toBeNull();
    });

    it('uses fallback avatar for activities without assets', () => {
      const activity: ConnectAppActivity = {
        level: 'account' as const,
        account: {
          fingerprint: 'test-fingerprint',
          accountIndex: 0,
        },
        timestamp: 0,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.activityAvatar).toBe('fallback');
      expect(result.asset).toBeUndefined();
    });

    it('generates consistent key for same activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        status: 'success',
        type: 'sendAsset',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };

      const result1 = createActivityView(activity, defaultCurrentNetwork);
      const result2 = createActivityView(activity, defaultCurrentNetwork);

      expect(result1.key).toBeDefined();
      expect(result2.key).toBeDefined();
      expect(result1.key).toBe(result2.key);
    });

    it('sets fromAsset and toAsset to undefined for non-swap activities', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        status: 'success',
        type: 'sendAsset',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.fromAsset).toBeUndefined();
      expect(result.toAsset).toBeUndefined();
    });

    it('handles pending activity status', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        status: 'pending',
        type: 'sendAsset',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.statusLabel).toBe('Sending');
      expect(result.statusIndicator).toBe('pending');
    });

    it('handles failed activity status', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        status: 'failed',
        type: 'sendAsset',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };

      const result = createActivityView(activity, defaultCurrentNetwork);

      expect(result.statusLabel).toBe('Send Failed');
      expect(result.statusIndicator).toBe('failed');
    });
  });
});
