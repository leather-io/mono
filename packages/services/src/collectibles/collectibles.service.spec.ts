import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccountAddresses, InscriptionAsset, Sip9Asset, StampAsset } from '@leather.io/models';

import { CollectiblesService } from './collectibles.service';
import type { InscriptionsService } from './inscriptions.service';
import type { Sip9sService } from './sip9s.service';
import type { StampsService } from './stamps.service';

describe(CollectiblesService.name, () => {
  const mockInscriptions: InscriptionAsset[] = [
    {
      chain: 'bitcoin',
      category: 'nft',
      protocol: 'inscription',
      id: 'insc1',
      number: 1,
      mimeType: 'image/png',
    } as unknown as InscriptionAsset,
    {
      chain: 'bitcoin',
      category: 'nft',
      protocol: 'inscription',
      id: 'insc2',
      number: 2,
      mimeType: 'image/jpeg',
    } as unknown as InscriptionAsset,
  ];

  const mockStamps: StampAsset[] = [
    {
      chain: 'bitcoin',
      category: 'nft',
      protocol: 'stamp',
      stamp: 67890,
      stampUrl: 'https://stampchain.io/stamps/67890.png',
      stampExplorerUrl: 'https://stampchain.io/stamp/67890',
      blockHeight: 115,
    },
    {
      chain: 'bitcoin',
      category: 'nft',
      protocol: 'stamp',
      stamp: 12345,
      stampUrl: 'https://stampchain.io/stamps/12345.png',
      stampExplorerUrl: 'https://stampchain.io/stamp/12345',
      blockHeight: 105,
    },
  ];

  const mockSip9s: Sip9Asset[] = [
    {
      chain: 'stacks',
      category: 'nft',
      protocol: 'sip9',
      assetId: 'SP000.nft-2',
      name: 'NFT 2',
    } as Sip9Asset,
    {
      chain: 'stacks',
      category: 'nft',
      protocol: 'sip9',
      assetId: 'SP000.nft-1',
      name: 'NFT 1',
    } as Sip9Asset,
  ];

  const mockInscriptionsService = {
    getAccountInscriptions: vi.fn().mockResolvedValue(mockInscriptions),
  } as unknown as InscriptionsService;

  const mockStampsService = {
    getAccountStamps: vi.fn().mockResolvedValue(mockStamps),
  } as unknown as StampsService;

  const mockSip9sService = {
    getAccountSip9s: vi.fn().mockResolvedValue(mockSip9s),
  } as unknown as Sip9sService;

  const collectiblesService = new CollectiblesService(
    mockInscriptionsService,
    mockStampsService,
    mockSip9sService
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccountCollectibles', () => {
    it('aggregates collectibles from all services in correct order', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
        stacks: { stxAddress: 'ST123' },
      };

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(mockInscriptionsService.getAccountInscriptions).toHaveBeenCalledWith(
        { account },
        undefined
      );
      expect(mockStampsService.getAccountStamps).toHaveBeenCalledWith({ account }, undefined);
      expect(mockSip9sService.getAccountSip9s).toHaveBeenCalledWith({ account }, undefined);

      expect(collectibles).toHaveLength(6);

      // Stacks NFTs first, then inscriptions, then stamps
      expect(collectibles[0].protocol).toEqual('sip9');
      expect(collectibles[1].protocol).toEqual('sip9');
      expect(collectibles[2].protocol).toEqual('inscription');
      expect(collectibles[3].protocol).toEqual('inscription');
      expect(collectibles[4].protocol).toEqual('stamp');
      expect(collectibles[5].protocol).toEqual('stamp');
    });

    it('passes abort signal to all services', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
        },
        stacks: { stxAddress: 'ST123' },
      };

      const abortController = new AbortController();
      await collectiblesService.getAccountCollectibles({ account }, abortController.signal);

      expect(mockInscriptionsService.getAccountInscriptions).toHaveBeenCalledWith(
        { account },
        abortController.signal
      );
      expect(mockStampsService.getAccountStamps).toHaveBeenCalledWith(
        { account },
        abortController.signal
      );
      expect(mockSip9sService.getAccountSip9s).toHaveBeenCalledWith(
        { account },
        abortController.signal
      );
    });

    it('returns empty array when all services return empty', async () => {
      vi.spyOn(mockInscriptionsService, 'getAccountInscriptions').mockResolvedValueOnce([]);
      vi.spyOn(mockStampsService, 'getAccountStamps').mockResolvedValueOnce([]);
      vi.spyOn(mockSip9sService, 'getAccountSip9s').mockResolvedValueOnce([]);

      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
      };

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(collectibles).toHaveLength(0);
    });

    it('returns only stacks collectibles when bitcoin services return empty', async () => {
      vi.spyOn(mockInscriptionsService, 'getAccountInscriptions').mockResolvedValueOnce([]);
      vi.spyOn(mockStampsService, 'getAccountStamps').mockResolvedValueOnce([]);

      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(collectibles).toHaveLength(2);
      expect(collectibles.every(c => c.protocol === 'sip9')).toBe(true);
    });

    it('returns only bitcoin collectibles when stacks service returns empty', async () => {
      vi.spyOn(mockSip9sService, 'getAccountSip9s').mockResolvedValueOnce([]);

      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(collectibles).toHaveLength(4);
      expect(collectibles.filter(c => c.protocol === 'inscription')).toHaveLength(2);
      expect(collectibles.filter(c => c.protocol === 'stamp')).toHaveLength(2);
    });
  });
});
