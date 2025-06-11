import { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import { describe, expect, it, vi } from 'vitest';

import {
  AccountAddresses,
  CryptoAssetProtocols,
  InscriptionAsset,
  Sip9Asset,
} from '@leather.io/models';

import { Sip9AssetService } from '../assets/sip9-asset.service';
import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
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
          bitcoin: { taprootDescriptor: 'desc1', nativeSegwitDescriptor: 'native1' },
          stacks: { stxAddress: 'ST123' },
        },
        {
          id: { fingerprint: 'fp2', accountIndex: 0 },
          bitcoin: { taprootDescriptor: 'desc2', nativeSegwitDescriptor: 'native2' },
          stacks: { stxAddress: 'ST456' },
        },
      ];

      const collectibles = await collectiblesService.getTotalCollectibles(accounts);

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(2);
      expect(mockStacksApiClient.getNftHoldings).toHaveBeenCalledTimes(2);
      expect(mockSip9AssetService.getAsset).toHaveBeenCalledTimes(4);

      expect(collectibles).toHaveLength(8);

      // Stacks NFTs first, then Inscriptions
      expect(collectibles[0].protocol).toEqual('sip9');
      expect(collectibles[1].protocol).toEqual('sip9');
      expect(collectibles[2].protocol).toEqual('sip9');
      expect(collectibles[3].protocol).toEqual('sip9');
      expect(collectibles[4].protocol).toEqual('inscription');
      expect(collectibles[5].protocol).toEqual('inscription');
      expect(collectibles[6].protocol).toEqual('inscription');
      expect(collectibles[7].protocol).toEqual('inscription');
      // Stacks NFTs sorted by blockHeight, Inscriptions by last_transfer_height
      expect((collectibles[0] as Sip9Asset).assetId).toEqual('SP000.nft-2');
      expect((collectibles[1] as Sip9Asset).assetId).toEqual('SP000.nft-2');
      expect((collectibles[2] as Sip9Asset).assetId).toEqual('SP000.nft-1');
      expect((collectibles[3] as Sip9Asset).assetId).toEqual('SP000.nft-1');
      expect((collectibles[4] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[5] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[6] as InscriptionAsset).id).toEqual('insc2');
      expect((collectibles[7] as InscriptionAsset).id).toEqual('insc2');
    });

    it('handles accounts with only bitcoin addresses', async () => {
      const accounts: AccountAddresses[] = [
        {
          id: { fingerprint: 'fp1', accountIndex: 0 },
          bitcoin: { taprootDescriptor: 'desc1', nativeSegwitDescriptor: 'native1' },
        },
      ];

      const collectibles = await collectiblesService.getTotalCollectibles(accounts);

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(1);
      expect(mockStacksApiClient.getNftHoldings).not.toHaveBeenCalled();
      expect(collectibles).toHaveLength(2);
      expect(collectibles[0].protocol).toEqual('inscription');
      expect(collectibles[1].protocol).toEqual('inscription');
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
        bitcoin: { taprootDescriptor: 'desc1', nativeSegwitDescriptor: 'native1' },
        stacks: { stxAddress: 'ST123' },
      };

      const collectibles = await collectiblesService.getAccountCollectibles(account);

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(1);
      expect(mockStacksApiClient.getNftHoldings).toHaveBeenCalledTimes(1);
      expect(collectibles).toHaveLength(4);
      // Stacks NFTs first, then Inscriptions
      expect(collectibles[0].protocol).toEqual('sip9');
      expect(collectibles[1].protocol).toEqual('sip9');
      expect(collectibles[2].protocol).toEqual('inscription');
      expect(collectibles[3].protocol).toEqual('inscription');
      // Stacks NFTs sorted by blockHeight, Inscriptions by last_transfer_height
      expect((collectibles[0] as Sip9Asset).assetId).toEqual('SP000.nft-2');
      expect((collectibles[1] as Sip9Asset).assetId).toEqual('SP000.nft-1');
      expect((collectibles[2] as InscriptionAsset).id).toEqual('insc1');
      expect((collectibles[3] as InscriptionAsset).id).toEqual('insc2');
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
  });
});
