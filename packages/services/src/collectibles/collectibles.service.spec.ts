import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccountAddresses, InscriptionAsset, Sip9Asset } from '@leather.io/models';

import type { BnsService } from '../bns/bns.service';
import { CollectiblesService } from './collectibles.service';
import type { InscriptionsService } from './inscriptions.service';
import type { Sip9sService } from './sip9s.service';

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

  const mockSip9sService = {
    getAccountSip9s: vi.fn().mockResolvedValue(mockSip9s),
  } as unknown as Sip9sService;

  const mockBnsService = {
    getAccountBnsNames: vi.fn().mockResolvedValue([]),
  } as unknown as BnsService;

  const collectiblesService = new CollectiblesService(
    mockInscriptionsService,
    mockSip9sService,
    mockBnsService
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
      expect(mockSip9sService.getAccountSip9s).toHaveBeenCalledWith({ account }, undefined);

      expect(collectibles).toHaveLength(4);

      expect(collectibles[0].protocol).toEqual('sip9');
      expect(collectibles[1].protocol).toEqual('sip9');
      expect(collectibles[2].protocol).toEqual('inscription');
      expect(collectibles[3].protocol).toEqual('inscription');
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
      expect(mockSip9sService.getAccountSip9s).toHaveBeenCalledWith(
        { account },
        abortController.signal
      );
    });

    it('returns empty array when all services return empty', async () => {
      vi.spyOn(mockInscriptionsService, 'getAccountInscriptions').mockResolvedValueOnce([]);
      vi.spyOn(mockSip9sService, 'getAccountSip9s').mockResolvedValueOnce([]);

      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
      };

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(collectibles).toHaveLength(0);
    });

    it('returns only stacks collectibles when bitcoin services return empty', async () => {
      vi.spyOn(mockInscriptionsService, 'getAccountInscriptions').mockResolvedValueOnce([]);

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

      expect(collectibles).toHaveLength(2);
      expect(collectibles.filter(c => c.protocol === 'inscription')).toHaveLength(2);
    });

    it('filters out SIP-9 NFTs whose names match owned BNS names', async () => {
      const bnsMatchingSip9: Sip9Asset = {
        chain: 'stacks',
        category: 'nft',
        protocol: 'sip9',
        assetId: 'SP2QEZ.BNS-V2.bns::names',
        name: 'alice.btc',
      } as Sip9Asset;

      vi.spyOn(mockSip9sService, 'getAccountSip9s').mockResolvedValueOnce([
        ...mockSip9s,
        bnsMatchingSip9,
      ]);
      vi.spyOn(mockBnsService, 'getAccountBnsNames').mockResolvedValueOnce([
        {
          owner: 'ST123',
          name: 'alice',
          namespace: 'btc',
          fullName: 'alice.btc',
          renewalHeight: 0,
          registeredAtBlockNumber: 100,
          isPrimary: true,
        },
      ]);

      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      const sip9s = collectibles.filter(c => c.protocol === 'sip9');
      expect(sip9s).toHaveLength(2);
      expect(sip9s.every(c => c.name !== 'alice.btc')).toBe(true);
    });

    it('keeps all SIP-9s when user has no BNS names', async () => {
      vi.spyOn(mockBnsService, 'getAccountBnsNames').mockResolvedValueOnce([]);

      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(collectibles.filter(c => c.protocol === 'sip9')).toHaveLength(2);
    });
  });
});
