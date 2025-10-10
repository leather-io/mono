import { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AccountAddresses,
  CryptoAssetProtocols,
  InscriptionAsset,
  Sip9Asset,
} from '@leather.io/models';

import { Sip9AssetService } from '../assets/sip9-asset.service';
import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { StampchainApiClient } from '../infrastructure/api/stampchain/stampchain-api.client';
import { CollectiblesService } from './collectibles.service';

describe(CollectiblesService.name, () => {
  const mockBisApiClient = {
    fetchInscriptions: vi.fn().mockResolvedValue([
      {
        inscription_id: 'insc1',
        inscription_number: 1,
        content_url: 'https://example.com/1',
        mime_type: 'image/png',
        owner_wallet_addr: 'bc1abc',
        satpoint: 'abc:0:0',
        genesis_block_hash: 'hash1',
        genesis_ts: '2025-01-01',
        genesis_height: 100,
        last_transfer_block_height: 120,
        output_value: 1000,
      },
      {
        inscription_id: 'insc2',
        inscription_number: 2,
        content_url: 'https://example.com/2',
        mime_type: 'image/jpeg',
        owner_wallet_addr: 'bc1def',
        satpoint: 'def:0:0',
        genesis_block_hash: 'hash2',
        genesis_ts: '2025-01-02',
        genesis_height: 110,
        last_transfer_block_height: 110,
        output_value: 2000,
      },
    ]),
  } as unknown as BestInSlotApiClient;

  const mockStacksApiClient = {
    getNftHoldings: vi.fn().mockResolvedValue([
      {
        asset_identifier: 'SP000.nft-1',
        value: { hex: '0x01' },
        block_height: 90,
      },
      {
        asset_identifier: 'SP000.nft-2',
        value: { hex: '0x02' },
        block_height: 95,
      },
    ] as NonFungibleTokenHolding[]),
  } as unknown as HiroStacksApiClient;

  const mockStampchainApiClient = {
    getStampsByAddress: vi.fn().mockResolvedValue([
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
    ]),
  } as unknown as StampchainApiClient;

  const mockSip9AssetService = {
    getAsset: vi.fn().mockImplementation((assetId: string) =>
      Promise.resolve({
        protocol: CryptoAssetProtocols.sip9,
        assetId,
      })
    ),
  } as unknown as Sip9AssetService;

  const collectiblesService = new CollectiblesService(
    mockBisApiClient,
    mockStacksApiClient,
    mockStampchainApiClient,
    mockSip9AssetService
  );

  describe('getTotalCollectibles', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('aggregates collectibles from multiple accounts and sorts as expected', async () => {
      const accounts: AccountAddresses[] = [
        {
          id: { fingerprint: 'fp1', accountIndex: 0 },
          bitcoin: {
            taprootDescriptor: 'desc1',
            nativeSegwitDescriptor: 'native1',
            zeroIndexNativeSegwitPayerAddress: 'bc1native1',
          },
          stacks: { stxAddress: 'ST123' },
        },
        {
          id: { fingerprint: 'fp2', accountIndex: 0 },
          bitcoin: {
            taprootDescriptor: 'desc2',
            nativeSegwitDescriptor: 'native2',
            zeroIndexNativeSegwitPayerAddress: 'bc1native2',
          },
          stacks: { stxAddress: 'ST456' },
        },
      ];

      const collectibles = await collectiblesService.getTotalCollectibles(accounts);

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(4);
      expect(mockStacksApiClient.getNftHoldings).toHaveBeenCalledTimes(2);
      expect(mockStampchainApiClient.getStampsByAddress).toHaveBeenCalledTimes(2);
      expect(mockSip9AssetService.getAsset).toHaveBeenCalledTimes(4);

      expect(collectibles).toHaveLength(16);

      // Stacks NFTs first, then Bitcoin collectibles (inscriptions + stamps) sorted by block height
      // Block 120: 4x insc1, Block 115: 2x stamp 67890, Block 110: 4x insc2, Block 105: 2x stamp 12345
      expect(collectibles[0].protocol).toEqual('sip9');
      expect(collectibles[1].protocol).toEqual('sip9');
      expect(collectibles[2].protocol).toEqual('sip9');
      expect(collectibles[3].protocol).toEqual('sip9');
      expect(collectibles[4].protocol).toEqual('inscription');
      expect(collectibles[5].protocol).toEqual('inscription');
      expect(collectibles[6].protocol).toEqual('inscription');
      expect(collectibles[7].protocol).toEqual('inscription');
      expect(collectibles[8].protocol).toEqual('stamp');
      expect(collectibles[9].protocol).toEqual('stamp');
      expect(collectibles[10].protocol).toEqual('inscription');
      expect(collectibles[11].protocol).toEqual('inscription');
      expect(collectibles[12].protocol).toEqual('inscription');
      expect(collectibles[13].protocol).toEqual('inscription');
      expect(collectibles[14].protocol).toEqual('stamp');
      expect(collectibles[15].protocol).toEqual('stamp');
      // Verify specific assets at correct indices
      expect((collectibles[0] as Sip9Asset).assetId).toEqual('SP000.nft-2');
      expect((collectibles[1] as Sip9Asset).assetId).toEqual('SP000.nft-2');
      expect((collectibles[2] as Sip9Asset).assetId).toEqual('SP000.nft-1');
      expect((collectibles[3] as Sip9Asset).assetId).toEqual('SP000.nft-1');
      expect((collectibles[4] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[5] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[6] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[7] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[10] as InscriptionAsset).id).toEqual('insc2');
      expect((collectibles[11] as InscriptionAsset).id).toEqual('insc2');
      expect((collectibles[12] as InscriptionAsset).id).toEqual('insc2');
      expect((collectibles[13] as InscriptionAsset).id).toEqual('insc2');
    });

    it('handles accounts with only bitcoin addresses', async () => {
      const accounts: AccountAddresses[] = [
        {
          id: { fingerprint: 'fp1', accountIndex: 0 },
          bitcoin: {
            taprootDescriptor: 'desc1',
            nativeSegwitDescriptor: 'native1',
            zeroIndexNativeSegwitPayerAddress: 'bc1native1',
          },
        },
      ];

      const collectibles = await collectiblesService.getTotalCollectibles(accounts);

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(2);
      expect(mockStacksApiClient.getNftHoldings).not.toHaveBeenCalled();
      expect(mockStampchainApiClient.getStampsByAddress).toHaveBeenCalledTimes(1);
      expect(collectibles).toHaveLength(6);
      // Bitcoin collectibles sorted by block height: Block 120: 2x insc1, Block 115: 1x stamp 67890, Block 110: 2x insc2, Block 105: 1x stamp 12345
      expect(collectibles[0].protocol).toEqual('inscription');
      expect(collectibles[1].protocol).toEqual('inscription');
      expect(collectibles[2].protocol).toEqual('stamp');
      expect(collectibles[3].protocol).toEqual('inscription');
      expect(collectibles[4].protocol).toEqual('inscription');
      expect(collectibles[5].protocol).toEqual('stamp');
      expect((collectibles[0] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[1] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[3] as InscriptionAsset).id).toEqual('insc2');
      expect((collectibles[4] as InscriptionAsset).id).toEqual('insc2');
    });

    it('handles accounts with only stacks addresses', async () => {
      const accounts: AccountAddresses[] = [
        {
          id: { fingerprint: 'fp1', accountIndex: 0 },
          stacks: { stxAddress: 'ST123' },
        },
      ];

      const collectibles = await collectiblesService.getTotalCollectibles(accounts);

      expect(mockStacksApiClient.getNftHoldings).toHaveBeenCalledTimes(1);
      expect(mockBisApiClient.fetchInscriptions).not.toHaveBeenCalled();
      expect(collectibles).toHaveLength(2);
      expect(collectibles[0].protocol).toEqual('sip9');
      expect(collectibles[1].protocol).toEqual('sip9');
    });
  });

  describe('getAccountCollectibles', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns both bitcoin and stacks collectibles for an account and sorts as expected', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
        stacks: { stxAddress: 'ST123' },
      };

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(2);
      expect(mockStacksApiClient.getNftHoldings).toHaveBeenCalledTimes(1);
      expect(mockStampchainApiClient.getStampsByAddress).toHaveBeenCalledTimes(1);
      expect(collectibles).toHaveLength(8);
      // Stacks NFTs first, then Inscriptions, then Stamps
      expect(collectibles[0].protocol).toEqual('sip9');
      expect(collectibles[1].protocol).toEqual('sip9');
      expect(collectibles[2].protocol).toEqual('inscription');
      expect(collectibles[3].protocol).toEqual('inscription');
      expect(collectibles[4].protocol).toEqual('inscription');
      expect(collectibles[5].protocol).toEqual('inscription');
      expect(collectibles[6].protocol).toEqual('stamp');
      expect(collectibles[7].protocol).toEqual('stamp');
      // Stacks NFTs sorted by blockHeight, Inscriptions by last_transfer_height
      expect((collectibles[0] as Sip9Asset).assetId).toEqual('SP000.nft-2');
      expect((collectibles[1] as Sip9Asset).assetId).toEqual('SP000.nft-1');
      expect((collectibles[2] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[3] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[4] as InscriptionAsset).id).toEqual('insc2');
      expect((collectibles[5] as InscriptionAsset).id).toEqual('insc2');
    });

    it('handles failed NFT asset info fetches', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      vi.spyOn(mockSip9AssetService, 'getAsset').mockRejectedValueOnce(
        new Error('Failed to fetch')
      );
      const collectibles = await collectiblesService.getAccountCollectibles(account);

      expect(collectibles).toHaveLength(1);
      expect(mockSip9AssetService.getAsset).toHaveBeenCalledTimes(2);
    });

    it('handles empty accounts', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
      };

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      expect(mockBisApiClient.fetchInscriptions).not.toHaveBeenCalled();
      expect(mockStacksApiClient.getNftHoldings).not.toHaveBeenCalled();
      expect(collectibles).toHaveLength(0);
    });
  });

  describe('API client error handling', () => {
    it('catches BIS API errors and returns empty inscriptions list', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: { taprootDescriptor: 'desc1', nativeSegwitDescriptor: 'native1' },
      };

      vi.spyOn(mockBisApiClient, 'fetchInscriptions').mockRejectedValueOnce('BIS API error');

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      expect(collectibles).toHaveLength(0);
    });

    it('catches Stacks API errors and returns empty sip9s list', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      vi.spyOn(mockStacksApiClient, 'getNftHoldings').mockRejectedValueOnce('Stacks API error');

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      expect(collectibles).toHaveLength(0);
    });

    it('catches Stampchain API errors and returns empty stamps list', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      vi.spyOn(mockStampchainApiClient, 'getStampsByAddress').mockRejectedValueOnce(
        'Stampchain API error'
      );

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      expect(collectibles).toHaveLength(4);
      expect(collectibles.every(c => c.protocol === 'inscription')).toBe(true);
    });
  });

  describe('Stamps', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns stamps for accounts with native segwit addresses', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      expect(mockStampchainApiClient.getStampsByAddress).toHaveBeenCalledWith('bc1native1', {
        signal: undefined,
      });
      expect(collectibles.filter(c => c.protocol === 'stamp')).toHaveLength(2);
    });

    it('does not fetch stamps when native segwit address is not present', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: { taprootDescriptor: 'desc1', nativeSegwitDescriptor: 'native1' },
      };

      await collectiblesService.getAccountCollectibles(account);

      expect(mockStampchainApiClient.getStampsByAddress).not.toHaveBeenCalled();
    });

    it('includes stamp metadata correctly', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      const stamps = collectibles.filter(c => c.protocol === 'stamp');
      expect(stamps).toHaveLength(2);

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

    it('sorts stamps by block height correctly', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      const stamps = collectibles.filter(c => c.protocol === 'stamp');

      expect(stamps[0].stamp).toBe(67890);
      expect(stamps[1].stamp).toBe(12345);
    });
  });
});
