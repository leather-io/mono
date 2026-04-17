import { describe, expect, it } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type {
  DeploySmartContractActivity,
  ExecuteSmartContractActivity,
  InscriptionAsset,
  ReceiveAssetActivity,
  SendAssetActivity,
  SwapAssetsActivity,
} from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import {
  formatActivityStatusLabel,
  getActivityStatusIndicatorId,
  hasActivityStatus,
} from './activity-status';

const baseActivity = {
  level: 'account' as const,
  account: {
    fingerprint: 'test-fingerprint',
    accountIndex: 0,
  },
  timestamp: 0,
  txid: 'txid',
};

describe('activity-status', () => {
  describe('hasActivityStatus', () => {
    it('returns true for activity with status', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(hasActivityStatus(activity)).toBe(true);
    });

    it('returns false for activity without status', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(hasActivityStatus(activity as any)).toBe(false);
    });
  });

  describe('formatActivityStatusLabel', () => {
    it('extracts contract name from deploySmartContract activity', () => {
      const activity: DeploySmartContractActivity = {
        ...baseActivity,
        type: 'deploySmartContract',
        status: 'success',
        contractId: 'SP123.my-contract',
      };
      expect(formatActivityStatusLabel(activity)).toBe('my-contract');
    });

    it('extracts contract name from executeSmartContract activity', () => {
      const activity: ExecuteSmartContractActivity = {
        ...baseActivity,
        type: 'executeSmartContract',
        status: 'success',
        contractId: 'SP456.another-contract',
        functionName: 'transfer',
      };
      expect(formatActivityStatusLabel(activity)).toBe('another-contract');
    });

    it('returns Unknown when contract name cannot be extracted', () => {
      const activity: DeploySmartContractActivity = {
        ...baseActivity,
        type: 'deploySmartContract',
        status: 'success',
        contractId: 'invalid',
      };
      expect(formatActivityStatusLabel(activity)).toBe('Unknown');
    });

    it('formats swapAssets label with fungible asset symbols', () => {
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        type: 'swapAssets',
        status: 'success',
        fromAsset: btcAsset,
        fromAmount: initBigNumber(1),
        toAsset: stxAsset,
        toAmount: initBigNumber(2),
      };
      expect(formatActivityStatusLabel(activity)).toBe('BTC → STX');
    });

    it('formats swapAssets label for inscription assets', () => {
      const inscriptionAsset: InscriptionAsset = {
        chain: 'bitcoin',
        category: 'nft',
        protocol: 'inscription',
        id: 'inscription-id-123',
        mimeType: 'image',
        number: 456,
        address: 'bc1q...',
        title: 'Cool Inscription',
        txid: 'tx123',
        output: 'output',
        offset: '0',
        preview: 'https://example.com/preview.png',
        src: 'https://example.com/inscription.png',
        value: '10000',
        genesisBlockHash: 'blockhash123',
        genesisTimestamp: 1640000000,
        genesisBlockHeight: 800000,
      };
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        type: 'swapAssets',
        status: 'success',
        fromAsset: inscriptionAsset,
        fromAmount: initBigNumber(1),
        toAsset: { ...inscriptionAsset, title: 'Another Inscription' },
        toAmount: initBigNumber(1),
      };
      expect(formatActivityStatusLabel(activity)).toBe('Cool Inscription → Another Inscription');
    });

    it('formats swapAssets label using category as fallback', () => {
      const unknownAsset = {
        chain: 'bitcoin' as const,
        category: 'unknown' as const,
        protocol: 'unknown' as const,
        name: 'Unknown',
        decimals: 0,
        hasMemo: false,
      };
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        type: 'swapAssets',
        status: 'success',
        fromAsset: unknownAsset as any,
        fromAmount: initBigNumber(1),
        toAsset: unknownAsset as any,
        toAmount: initBigNumber(1),
      };
      expect(formatActivityStatusLabel(activity)).toBe('unknown → unknown');
    });

    it('returns Sent for successful sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(formatActivityStatusLabel(activity)).toBe('Sent');
    });

    it('returns Sending for pending sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'pending',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(formatActivityStatusLabel(activity)).toBe('Sending');
    });

    it('returns Send Failed for failed sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'failed',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(formatActivityStatusLabel(activity)).toBe('Send Failed');
    });

    it('returns Received for successful receiveAsset activity', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        type: 'receiveAsset',
        status: 'success',
        asset: btcAsset,
        senders: ['sender-address'],
        amount: initBigNumber(1),
      };
      expect(formatActivityStatusLabel(activity)).toBe('Received');
    });

    it('uses fallback status for activity without status', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(formatActivityStatusLabel(activity as any)).toBe('Connected');
    });
  });

  describe('getActivityStatusIndicatorId', () => {
    it('returns hidden for activity without status', () => {
      const activity = {
        ...baseActivity,
        type: 'connectApp',
        appName: 'Test App',
        appUrl: 'https://test.com',
      };
      expect(getActivityStatusIndicatorId(activity as any)).toBe('hidden');
    });

    it('returns pending for pending activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'pending',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(getActivityStatusIndicatorId(activity)).toBe('pending');
    });

    it('returns failed for failed activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'failed',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(getActivityStatusIndicatorId(activity)).toBe('failed');
    });

    it('returns sent for successful sendAsset activity', () => {
      const activity: SendAssetActivity = {
        ...baseActivity,
        type: 'sendAsset',
        status: 'success',
        asset: btcAsset,
        receivers: ['receiver-address'],
        amount: initBigNumber(1),
      };
      expect(getActivityStatusIndicatorId(activity)).toBe('sent');
    });

    it('returns received for successful receiveAsset activity', () => {
      const activity: ReceiveAssetActivity = {
        ...baseActivity,
        type: 'receiveAsset',
        status: 'success',
        asset: btcAsset,
        senders: ['sender-address'],
        amount: initBigNumber(1),
      };
      expect(getActivityStatusIndicatorId(activity)).toBe('received');
    });

    it('returns swap for successful swapAssets activity', () => {
      const activity: SwapAssetsActivity = {
        ...baseActivity,
        type: 'swapAssets',
        status: 'success',
        fromAsset: btcAsset,
        fromAmount: initBigNumber(1),
        toAsset: stxAsset,
        toAmount: initBigNumber(2),
      };
      expect(getActivityStatusIndicatorId(activity)).toBe('swap');
    });

    it('returns function for successful executeSmartContract activity', () => {
      const activity: ExecuteSmartContractActivity = {
        ...baseActivity,
        type: 'executeSmartContract',
        status: 'success',
        contractId: 'SP123.contract',
        functionName: 'transfer',
      };
      expect(getActivityStatusIndicatorId(activity)).toBe('function');
    });

    it('returns hidden for other successful activity types', () => {
      const activity: DeploySmartContractActivity = {
        ...baseActivity,
        type: 'deploySmartContract',
        status: 'success',
        contractId: 'SP123.contract',
      };
      expect(getActivityStatusIndicatorId(activity)).toBe('hidden');
    });
  });
});
