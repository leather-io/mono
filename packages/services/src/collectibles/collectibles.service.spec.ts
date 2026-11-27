import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccountAddresses, Sip9Asset } from '@leather.io/models';

import { createTestSip9Asset } from '../test/assets-sip9';
import { createMock } from '../test/create-mock';
import { CollectiblesService } from './collectibles.service';
import type { Sip9sService } from './sip9s.service';

describe(CollectiblesService.name, () => {
  const mockSip9s: Sip9Asset[] = [
    createTestSip9Asset({
      assetId: 'SP000.nft-2',
      name: 'NFT 2',
    }),
    createTestSip9Asset({
      assetId: 'SP000.nft-1',
      name: 'NFT 1',
    }),
  ];

  const getAccountSip9s = vi.fn().mockResolvedValue(mockSip9s);
  const mockSip9sService = createMock<Sip9sService>({ getAccountSip9s });

  const collectiblesService = new CollectiblesService(mockSip9sService);

  const account: AccountAddresses = {
    id: { fingerprint: 'fp1', accountIndex: 0 },
    stacks: { stxAddress: 'ST123' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccountCollectibles', () => {
    it('returns stacks collectibles', async () => {
      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(mockSip9sService.getAccountSip9s).toHaveBeenCalledWith({ account }, undefined);

      expect(collectibles).toHaveLength(2);
      expect(collectibles.every(c => c.protocol === 'sip9')).toBe(true);
    });

    it('passes abort signal to all services', async () => {
      const abortController = new AbortController();
      await collectiblesService.getAccountCollectibles({ account }, abortController.signal);

      expect(mockSip9sService.getAccountSip9s).toHaveBeenCalledWith(
        { account },
        abortController.signal
      );
    });

    it('returns empty array when all services return empty', async () => {
      vi.spyOn(mockSip9sService, 'getAccountSip9s').mockResolvedValueOnce([]);

      const collectibles = await collectiblesService.getAccountCollectibles({
        account: { id: { fingerprint: 'fp1', accountIndex: 0 } },
      });

      expect(collectibles).toHaveLength(0);
    });

    it('returns BNS names', async () => {
      const bnsName = createTestSip9Asset({
        assetId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2::BNS-V2',
        name: 'alice.btc',
      });
      vi.spyOn(mockSip9sService, 'getAccountSip9s').mockResolvedValueOnce([...mockSip9s, bnsName]);

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(collectibles).toHaveLength(3);
      expect(collectibles).toContainEqual(bnsName);
    });

    it('puts BNS v1 names last', async () => {
      const bnsV1Name = createTestSip9Asset({
        assetId: 'SP000000000000000000002Q6VF78.bns::names',
        name: 'satoshi.btc',
      });
      vi.spyOn(mockSip9sService, 'getAccountSip9s').mockResolvedValueOnce([
        bnsV1Name,
        ...mockSip9s,
      ]);

      const collectibles = await collectiblesService.getAccountCollectibles({ account });

      expect(collectibles.map(c => c.name)).toEqual(['NFT 2', 'NFT 1', 'satoshi.btc']);
    });
  });
});
