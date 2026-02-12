import type { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type AccountAddresses, CryptoAssetProtocols, type Sip9Asset } from '@leather.io/models';

import type { Sip9AssetService } from '../assets/sip9-asset.service';
import type { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { Sip9sService } from './sip9s.service';

describe(Sip9sService.name, () => {
  const mockNftHoldings: NonFungibleTokenHolding[] = [
    {
      asset_identifier: 'SP000.nft-1',
      value: { hex: '0x01', repr: '1' },
      block_height: 90,
      tx_id: 'tx1',
    },
    {
      asset_identifier: 'SP000.nft-2',
      value: { hex: '0x02', repr: '2' },
      block_height: 95,
      tx_id: 'tx2',
    },
  ];

  const mockStacksApiClient = {
    getNftHoldings: vi.fn().mockResolvedValue(mockNftHoldings),
  } as unknown as HiroStacksApiClient;

  const mockSip9AssetService = {
    getAsset: vi.fn().mockImplementation((assetId: string) =>
      Promise.resolve({
        protocol: CryptoAssetProtocols.sip9,
        assetId,
        name: 'Test NFT',
        content: { contentUrl: 'https://example.com/image.png', contentType: 'image/png' },
      })
    ),
  } as unknown as Sip9AssetService;

  const sip9sService = new Sip9sService(mockStacksApiClient, mockSip9AssetService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccountSip9s', () => {
    it('fetches SIP-9 NFTs for accounts with stacks addresses', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      const sip9s = await sip9sService.getAccountSip9s({ account });

      expect(mockStacksApiClient.getNftHoldings).toHaveBeenCalledWith('ST123', {
        signal: undefined,
      });
      expect(mockSip9AssetService.getAsset).toHaveBeenCalledTimes(2);
      expect(sip9s).toHaveLength(2);
    });

    it('sorts SIP-9 NFTs by block height descending', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      const sip9s = await sip9sService.getAccountSip9s({ account });

      // nft-2 has block_height: 95, nft-1 has 90
      expect(sip9s[0].assetId).toEqual('SP000.nft-2');
      expect(sip9s[1].assetId).toEqual('SP000.nft-1');
    });

    it('returns empty array when account has no stacks address', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
        },
      };

      const sip9s = await sip9sService.getAccountSip9s({ account });

      expect(mockStacksApiClient.getNftHoldings).not.toHaveBeenCalled();
      expect(sip9s).toHaveLength(0);
    });

    it('filters out failed asset fetches gracefully', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      vi.spyOn(mockSip9AssetService, 'getAsset').mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      const sip9s = await sip9sService.getAccountSip9s({ account });

      expect(mockSip9AssetService.getAsset).toHaveBeenCalledTimes(2);
      expect(sip9s).toHaveLength(1);
    });

    it('filters out BNS - Archive NFTs', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      vi.spyOn(mockSip9AssetService, 'getAsset').mockResolvedValueOnce({
        protocol: CryptoAssetProtocols.sip9,
        assetId: 'SP000.bns-archive',
        name: 'BNS - Archive',
        content: { contentUrl: 'https://example.com/image.png', contentType: 'image/png' },
      } as Sip9Asset);

      const sip9s = await sip9sService.getAccountSip9s({ account });

      expect(sip9s).toHaveLength(1);
      expect(sip9s[0].assetId).not.toEqual('SP000.bns-archive');
    });

    it('filters out NFTs with empty contentUrl', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      vi.spyOn(mockSip9AssetService, 'getAsset').mockResolvedValueOnce({
        protocol: CryptoAssetProtocols.sip9,
        assetId: 'SP000.lp-token',
        name: 'LP Token',
        content: { contentUrl: '', contentType: '' },
      } as Sip9Asset);

      const sip9s = await sip9sService.getAccountSip9s({ account });

      expect(sip9s).toHaveLength(1);
      expect(sip9s[0].assetId).not.toEqual('SP000.lp-token');
    });

    it('catches Stacks API errors and returns empty array', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      vi.spyOn(mockStacksApiClient, 'getNftHoldings').mockRejectedValueOnce(
        new Error('Stacks API error')
      );

      const sip9s = await sip9sService.getAccountSip9s({ account });

      expect(sip9s).toHaveLength(0);
    });

    it('includes correct SIP-9 metadata', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      const sip9s = await sip9sService.getAccountSip9s({ account });

      expect(sip9s[0]).toMatchObject({
        protocol: 'sip9',
        assetId: 'SP000.nft-2',
      });
    });
  });
});
