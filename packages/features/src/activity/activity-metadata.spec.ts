import { describe, expect, it } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type {
  ConnectAppActivity,
  DeploySmartContractActivity,
  ExecuteSmartContractActivity,
  LockAssetActivity,
  ReceiveAssetActivity,
  SendAssetActivity,
  SignMessageActivity,
  SwapAssetsActivity,
} from '@leather.io/models';
import { createMoney, initBigNumber } from '@leather.io/utils';

import {
  getActivityAsset,
  getActivityAvatar,
  getActivityTitle,
  hasTxDetails,
} from './activity-metadata';

const baseActivity = {
  level: 'account' as const,
  account: {
    fingerprint: 'test-fingerprint',
    accountIndex: 0,
  },
  timestamp: 0,
};

describe('activity-metadata', () => {
  describe('hasTxDetails', () => {
    it('returns true for activity with txid and status', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(hasTxDetails(activity)).toBe(true);
    });

    it('returns false for activity without txid', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(hasTxDetails(activity as any)).toBe(false);
    });

    it('returns false for activity without status', () => {
      const activity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(hasTxDetails(activity as any)).toBe(false);
    });
  });

  describe('getActivityTitle', () => {
    it('returns crypto symbol for sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
        value: {
          crypto: createMoney(1, 'BTC'),
          quote: createMoney(50000, 'USD'),
        },
      };
      expect(getActivityTitle(activity)).toBe('BTC');
    });

    it('returns crypto symbol for receiveAsset activity', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'receiveAsset',
        status: 'success',
        asset: stxAsset,
        senders: ['sender-address'],
        amount: initBigNumber(100),
        value: {
          crypto: createMoney(100, 'STX'),
          quote: createMoney(50, 'USD'),
        },
      };
      expect(getActivityTitle(activity)).toBe('STX');
    });

    it('returns Token Transfer when crypto symbol is missing', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(getActivityTitle(activity)).toBe('Token Transfer');
    });

    it('returns status-based title for deploySmartContract activity', () => {
      const activity: DeploySmartContractActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'deploySmartContract',
        status: 'success',
        contractId: 'SP123.my-contract',
      };
      expect(getActivityTitle(activity)).toBe('Deployed');
    });

    it('returns function name for executeSmartContract activity', () => {
      const activity: ExecuteSmartContractActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'executeSmartContract',
        status: 'success',
        contractId: 'SP456.another-contract',
        functionName: 'transfer',
      };
      expect(getActivityTitle(activity)).toBe('transfer');
    });

    it('returns Deployed for deploy activity with empty contractId', () => {
      const activity: DeploySmartContractActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'deploySmartContract',
        status: 'success',
        contractId: '',
      };
      expect(getActivityTitle(activity)).toBe('Deployed');
    });

    it('returns Swap Assets for swapAssets activity', () => {
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'swapAssets',
        status: 'success',
        fromAsset: btcAsset,
        fromAmount: initBigNumber(1),
        toAsset: stxAsset,
        toAmount: initBigNumber(2),
      };
      expect(getActivityTitle(activity)).toBe('fungible → fungible');
    });

    it('returns Lock Asset for lockAsset activity', () => {
      const activity: LockAssetActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'lockAsset',
        status: 'success',
        asset: stxAsset,
        amount: initBigNumber(100),
      };
      expect(getActivityTitle(activity)).toBe('Lock Asset');
    });

    it('returns app name for connectApp activity', () => {
      const activity: ConnectAppActivity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Cool DApp',
        appUrl: 'https://cooldapp.com',
      };
      expect(getActivityTitle(activity)).toBe('Cool DApp');
    });

    it('returns app name for signMessage activity', () => {
      const activity: SignMessageActivity = {
        ...baseActivity,
        type: 'signMessage',
        appName: 'Message App',
        appUrl: 'https://messageapp.com',
      };
      expect(getActivityTitle(activity)).toBe('Message App');
    });

    it('returns Wallet Activity when app name is missing', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appUrl: 'https://app.com',
      };
      expect(getActivityTitle(activity as any)).toBe('Wallet Activity');
    });

    it('returns title for announcement activity', () => {
      const activity = {
        ...baseActivity,
        type: 'receiveAnnouncement',
        title: 'Important Update',
        body: 'Check this out',
      };
      expect(getActivityTitle(activity as any)).toBe('Important Update');
    });

    it('returns Announcement when title is missing', () => {
      const activity = {
        ...baseActivity,
        type: 'walletAdded',
        body: 'Wallet was added',
      };
      expect(getActivityTitle(activity as any)).toBe('Announcement');
    });

    it('returns Unknown for unrecognized activity types', () => {
      const activity = {
        ...baseActivity,
        type: 'unknownType',
      };
      expect(getActivityTitle(activity as any)).toBe('Unknown');
    });
  });

  describe('getActivityAsset', () => {
    it('returns asset from sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(getActivityAsset(activity)).toBe(btcAsset);
    });

    it('returns asset from receiveAsset activity', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'receiveAsset',
        status: 'success',
        asset: stxAsset,
        senders: ['sender-address'],
        amount: initBigNumber(100),
      };
      expect(getActivityAsset(activity)).toBe(stxAsset);
    });

    it('returns toAsset from swapAssets activity', () => {
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'swapAssets',
        status: 'success',
        fromAsset: btcAsset,
        fromAmount: initBigNumber(1),
        toAsset: stxAsset,
        toAmount: initBigNumber(2),
      };
      expect(getActivityAsset(activity)).toBe(stxAsset);
    });

    it('returns undefined for activity without asset', () => {
      const activity: ConnectAppActivity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(getActivityAsset(activity)).toBeUndefined();
    });
  });

  describe('getActivityAvatar', () => {
    it('returns swap for swapAssets activity', () => {
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'swapAssets',
        status: 'success',
        fromAsset: btcAsset,
        fromAmount: initBigNumber(1),
        toAsset: stxAsset,
        toAmount: initBigNumber(2),
      };
      expect(getActivityAvatar(activity)).toBe('swap');
    });

    it('returns asset for activity with asset', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        txid: 'tx123',
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(getActivityAvatar(activity)).toBe('asset');
    });

    it('returns fallback for activity without asset', () => {
      const activity: ConnectAppActivity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(getActivityAvatar(activity)).toBe('fallback');
    });
  });
});
