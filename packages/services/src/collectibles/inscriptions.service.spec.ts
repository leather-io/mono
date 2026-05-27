import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccountAddresses } from '@leather.io/models';

import type {
  BestInSlotApiClient,
  BisInscription,
} from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { InscriptionsService } from './inscriptions.service';

describe(InscriptionsService.name, () => {
  const mockBisInscriptions = [
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
  ];

  const mockBisApiClient = {
    fetchInscriptions: vi.fn().mockResolvedValue(mockBisInscriptions),
  } as unknown as BestInSlotApiClient;

  const inscriptionsService = new InscriptionsService(mockBisApiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccountInscriptions', () => {
    it('fetches inscriptions from both taproot and native segwit descriptors', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
          zeroIndexNativeSegwitPayerAddress: 'bc1native1',
        },
      };

      const inscriptions = await inscriptionsService.getAccountInscriptions({
        account,
        protections: { isOrdinalsActive: true },
      });

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(2);
      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledWith('native1', {
        signal: undefined,
        isOrdinalsActive: true,
      });
      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledWith('desc1', {
        signal: undefined,
        isOrdinalsActive: true,
      });
      expect(inscriptions).toHaveLength(4);
    });

    it('sorts inscriptions by last transfer block height descending', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
        },
      };

      const inscriptions = await inscriptionsService.getAccountInscriptions({
        account,
        protections: { isOrdinalsActive: true },
      });

      // Each descriptor returns both inscriptions, combined and sorted
      expect(inscriptions).toHaveLength(4);
      // Verify inscriptions are present (2 from each descriptor)
      const insc1Count = inscriptions.filter(i => i.id === 'insc1').length;
      const insc2Count = inscriptions.filter(i => i.id === 'insc2').length;
      expect(insc1Count).toEqual(2);
      expect(insc2Count).toEqual(2);
    });

    it('returns empty array when account has no bitcoin addresses', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        stacks: { stxAddress: 'ST123' },
      };

      const inscriptions = await inscriptionsService.getAccountInscriptions({
        account,
        protections: { isOrdinalsActive: true },
      });

      expect(mockBisApiClient.fetchInscriptions).not.toHaveBeenCalled();
      expect(inscriptions).toHaveLength(0);
    });

    it('excludes native segwit addresses when specified in exclusions', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
        },
      };

      const inscriptions = await inscriptionsService.getAccountInscriptions({
        account,
        protections: { isOrdinalsActive: true },
        exclusions: { nativeSegwitAddresses: true },
      });

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(1);
      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledWith('desc1', {
        signal: undefined,
        isOrdinalsActive: true,
      });
      expect(inscriptions).toHaveLength(2);
    });

    it('excludes taproot addresses when specified in exclusions', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
        },
      };

      const inscriptions = await inscriptionsService.getAccountInscriptions({
        account,
        protections: { isOrdinalsActive: true },
        exclusions: { taprootAddresses: true },
      });

      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledTimes(1);
      expect(mockBisApiClient.fetchInscriptions).toHaveBeenCalledWith('native1', {
        signal: undefined,
        isOrdinalsActive: true,
      });
      expect(inscriptions).toHaveLength(2);
    });

    it('catches BIS API errors and returns empty array', async () => {
      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: { taprootDescriptor: 'desc1', nativeSegwitDescriptor: 'native1' },
      };

      vi.spyOn(mockBisApiClient, 'fetchInscriptions').mockRejectedValueOnce(
        new Error('BIS API error')
      );

      const inscriptions = await inscriptionsService.getAccountInscriptions({
        account,
        protections: { isOrdinalsActive: true },
      });

      expect(inscriptions).toHaveLength(0);
    });

    it('includes correct inscription metadata', async () => {
      vi.spyOn(mockBisApiClient, 'fetchInscriptions').mockResolvedValueOnce([
        mockBisInscriptions[0] as unknown as BisInscription,
      ]);
      vi.spyOn(mockBisApiClient, 'fetchInscriptions').mockResolvedValueOnce([]);

      const account: AccountAddresses = {
        id: { fingerprint: 'fp1', accountIndex: 0 },
        bitcoin: {
          taprootDescriptor: 'desc1',
          nativeSegwitDescriptor: 'native1',
        },
      };

      const inscriptions = await inscriptionsService.getAccountInscriptions({
        account,
        protections: { isOrdinalsActive: true },
      });

      expect(inscriptions).toHaveLength(1);
      expect(inscriptions[0]).toMatchObject({
        chain: 'bitcoin',
        category: 'nft',
        protocol: 'inscription',
        id: 'insc1',
        number: 1,
      });
    });
  });
});
