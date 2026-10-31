import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type DefaultNetworkConfigurations, defaultNetworksKeyedById } from '@leather.io/models';

import { createMock } from '../../../test/create-mock';
import type { HttpCacheKeyArray, HttpCacheService } from '../../cache/http-cache.service';
import type { SettingsService } from '../../settings/settings.service';
import { EmilyApiClient } from './emily-api.client';
import type { EmilyDepositRequest } from './emily-api.types';

const depositRequest: EmilyDepositRequest = {
  bitcoinTxid: 'b'.repeat(64),
  bitcoinTxOutputIndex: 0,
  depositScript: 'deposit-script',
  reclaimScript: 'reclaim-script',
  transactionHex: 'tx-hex',
};

const sbtcLimits = {
  pegCap: 1000,
  perDepositCap: 100,
  perDepositMinimum: 1,
  perWithdrawalCap: 50,
  accountCaps: {},
};

const fetchWithCache = vi.fn<(key: HttpCacheKeyArray, fetchFn: () => Promise<unknown>) => void>();

function makeClient(networkId: DefaultNetworkConfigurations = 'mainnet') {
  const settingsService: SettingsService = {
    getSettings: () => ({
      network: defaultNetworksKeyedById[networkId],
      quoteCurrency: 'USD',
      assetVisibility: {},
    }),
  };
  const cacheService = createMock<HttpCacheService>({
    fetchWithCache(key, fetchFn) {
      fetchWithCache(key, fetchFn);
      return fetchFn();
    },
  });
  return new EmilyApiClient(settingsService, cacheService);
}

describe(EmilyApiClient.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSbtcLimits', () => {
    it('caches limits per emily base url', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: sbtcLimits });

      await makeClient('mainnet').getSbtcLimits();
      expect(fetchWithCache).toHaveBeenLastCalledWith(
        ['emily-api-get-sbtc-limits', 'https://sbtc-emily.com'],
        expect.any(Function)
      );

      await makeClient('testnet').getSbtcLimits();
      expect(fetchWithCache).toHaveBeenLastCalledWith(
        ['emily-api-get-sbtc-limits', 'https://testnet.sbtc-emily.com'],
        expect.any(Function)
      );
    });

    it('uses the hosted testnet emily url for the primary stacks testnet', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: sbtcLimits });

      await makeClient('primaryStacksTestnet').getSbtcLimits();
      expect(fetchWithCache).toHaveBeenLastCalledWith(
        ['emily-api-get-sbtc-limits', 'https://testnet.sbtc-emily.com'],
        expect.any(Function)
      );
    });

    it('uses the local emily url for the sbtc devenv', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: sbtcLimits });

      await makeClient('sbtcDevenv').getSbtcLimits();
      expect(fetchWithCache).toHaveBeenLastCalledWith(
        ['emily-api-get-sbtc-limits', 'http://localhost:3031'],
        expect.any(Function)
      );
    });

    it('bypasses the cache when skipCache is set', async () => {
      const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: sbtcLimits });

      await expect(makeClient().getSbtcLimits({ skipCache: true })).resolves.toEqual(sbtcLimits);

      expect(fetchWithCache).not.toHaveBeenCalled();
      expect(get).toHaveBeenCalledWith('https://sbtc-emily.com/limits', expect.anything());
    });

    it('does not forward the caller signal into the shared cached fetch', async () => {
      const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: sbtcLimits });
      const { signal } = new AbortController();

      await makeClient().getSbtcLimits({ signal });

      expect(get.mock.calls[0][1]).toEqual({ signal: undefined });
    });

    it('forwards the caller signal when bypassing the cache', async () => {
      const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: sbtcLimits });
      const { signal } = new AbortController();

      await makeClient().getSbtcLimits({ signal, skipCache: true });

      expect(get.mock.calls[0][1]).toEqual({ signal });
    });
  });

  describe('notifyDeposit', () => {
    it('posts the deposit to the network emily url with a timeout', async () => {
      const post = vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          bitcoinTxid: depositRequest.bitcoinTxid,
          bitcoinTxOutputIndex: 0,
          status: 'pending',
        },
      });

      await makeClient('testnet').notifyDeposit(depositRequest);

      expect(post).toHaveBeenCalledWith(
        'https://testnet.sbtc-emily.com/deposit',
        depositRequest,
        expect.objectContaining({ timeout: 10_000 })
      );
    });

    it('resolves on any 2xx regardless of the response body shape', async () => {
      vi.spyOn(axios, 'post').mockResolvedValue({ data: { bitcoinTxOutputIndex: '0' } });

      await expect(makeClient().notifyDeposit(depositRequest)).resolves.toBeUndefined();
    });

    it('propagates axios rejections for non-2xx responses', async () => {
      vi.spyOn(axios, 'post').mockRejectedValue(new Error('Request failed with status code 400'));

      await expect(makeClient().notifyDeposit(depositRequest)).rejects.toThrowError(
        'Request failed with status code 400'
      );
    });
  });
});
