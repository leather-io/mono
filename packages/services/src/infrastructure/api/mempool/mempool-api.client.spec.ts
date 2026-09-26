import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { HttpCacheService } from '../../cache/http-cache.service';
import { SettingsService } from '../../settings/settings.service';
import { MempoolApiClient } from './mempool-api.client';

const address = 'tb1qvz04jt55sy7a4e9fg447gm2zlmnjck3d4yhelq';

function createClient(network: NetworkConfiguration) {
  return new MempoolApiClient(
    {
      fetchWithCache: (_key: unknown, fetchFn: () => unknown) => fetchFn(),
    } as unknown as HttpCacheService,
    {
      getSettings: () => ({ network, quoteCurrency: 'USD', assetVisibility: {} }),
    } as unknown as SettingsService
  );
}

describe(MempoolApiClient.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchAddressTransactions', () => {
    it('fetches address transactions from the staking testnet mempool', async () => {
      const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });

      const result = await createClient(
        defaultNetworksKeyedById.stakingTestnet
      ).fetchAddressTransactions(address);

      expect(result).toEqual([]);
      expect(get).toHaveBeenCalledWith(
        `https://mempool.bitcoin.staking-testnet.hiro.so/api/address/${address}/txs`,
        expect.anything()
      );
    });

    it('rejects networks that read bitcoin from the leather api', async () => {
      const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });

      await expect(
        createClient(defaultNetworksKeyedById.mainnet).fetchAddressTransactions(address)
      ).rejects.toThrow('Mempool API is only supported on networks with their own mempool');
      expect(get).not.toHaveBeenCalled();
    });
  });
});
