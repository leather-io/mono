import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccountAddresses } from '@leather.io/models';

import type { StampchainApiClient } from '../infrastructure/api/stampchain/stampchain-api.client';
import { StampsService } from './stamps.service';

describe(StampsService.name, () => {
  const mockStamps = [
    {
      stamp: 12345,
      stamp_url: 'https://stampchain.io/stamps/12345.png',
      block_index: 105,
    },
    {
      stamp: 67890,
      stamp_url: 'https://stampchain.io/stamps/67890.png',
      block_index: 115,
    },
  ];

  const mockStampchainApiClient = {
    getStampsByAddress: vi.fn().mockResolvedValue(mockStamps),
  } as unknown as StampchainApiClient;

  const stampsService = new StampsService(mockStampchainApiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccountStamps', () => {
    it('fetches stamps for accounts with native segwit addresses', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const stamps = await stampsService.getAccountStamps({ account });

      expect(mockStampchainApiClient.getStampsByAddress).toHaveBeenCalledWith('bc1native1', {
        signal: undefined,
      });
      expect(stamps).toHaveLength(2);
    });

    it('sorts stamps by block height descending', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const stamps = await stampsService.getAccountStamps({ account });

      // stamp 67890 has block_index: 115, stamp 12345 has 105
      expect(stamps[0].stamp).toBe(67890);
      expect(stamps[1].stamp).toBe(12345);
    });

    it('returns empty array when native segwit address is not present', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: { taprootDescriptor: 'desc1', nativeSegwitDescriptor: 'native1' },
      };

      const stamps = await stampsService.getAccountStamps({ account });

      expect(mockStampchainApiClient.getStampsByAddress).not.toHaveBeenCalled();
      expect(stamps).toHaveLength(0);
    });

    it('returns empty array when account has no bitcoin addresses', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      const stamps = await stampsService.getAccountStamps({ account });

      expect(mockStampchainApiClient.getStampsByAddress).not.toHaveBeenCalled();
      expect(stamps).toHaveLength(0);
    });

    it('excludes stamps when native segwit addresses are excluded', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const stamps = await stampsService.getAccountStamps({
        account,
        exclusions: { nativeSegwitAddresses: true },
      });

      expect(mockStampchainApiClient.getStampsByAddress).not.toHaveBeenCalled();
      expect(stamps).toHaveLength(0);
    });

    it('catches Stampchain API errors and returns empty array', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      vi.spyOn(mockStampchainApiClient, 'getStampsByAddress').mockRejectedValueOnce(
        new Error('Stampchain API error')
      );

      const stamps = await stampsService.getAccountStamps({ account });

      expect(stamps).toHaveLength(0);
    });

    it('includes correct stamp metadata', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const stamps = await stampsService.getAccountStamps({ account });

      expect(stamps[0]).toMatchObject({
        chain: 'bitcoin',
        category: 'nft',
        protocol: 'stamp',
        stamp: 67890,
        stampUrl: 'https://stampchain.io/stamps/67890.png',
        stampExplorerUrl: 'https://stampchain.io/stamp/67890',
      });

      expect(stamps[1]).toMatchObject({
        chain: 'bitcoin',
        category: 'nft',
        protocol: 'stamp',
        stamp: 12345,
        stampUrl: 'https://stampchain.io/stamps/12345.png',
        stampExplorerUrl: 'https://stampchain.io/stamp/12345',
      });
    });
  });
});
