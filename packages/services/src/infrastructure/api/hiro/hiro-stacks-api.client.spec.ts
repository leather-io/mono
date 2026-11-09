import axios, { type AxiosInstance } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WalletDefaultNetworkConfigurationIds, defaultNetworksKeyedById } from '@leather.io/models';

import { createMock } from '../../../test/create-mock';
import { createTestPrincipalMempoolTokenTransferTx } from '../../../test/transactions-fixtures';
import type { HttpCacheKeyArray, HttpCacheService } from '../../cache/http-cache.service';
import { type RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import type { SettingsService } from '../../settings/settings.service';
import { hiroApiRequestsPriorityLevels } from './hiro-request-priorities';
import { HiroStacksApiClient } from './hiro-stacks-api.client';
import type { HiroPrincipalMempoolTransactionsResponse } from './hiro-stacks-api.types';

const principal = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const mainnet = defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.mainnet];

const mempoolResponse: HiroPrincipalMempoolTransactionsResponse = {
  total: 1,
  limit: 50,
  cursor: { next: null, previous: null, current: '1700000000:0xabc' },
  results: [createTestPrincipalMempoolTokenTransferTx({ tx_id: '0xabc' })],
};

const get = vi.fn();
const fetchWithCache = vi.fn<(key: HttpCacheKeyArray, fetchFn: () => Promise<unknown>) => void>();
const add = vi.fn();

function makeClient() {
  vi.spyOn(axios, 'create').mockReturnValue(createMock<AxiosInstance>({ get }));
  const settingsService: SettingsService = {
    getSettings: () => ({ network: mainnet, quoteCurrency: 'USD', assetVisibility: {} }),
  };
  const cacheService = createMock<HttpCacheService>({
    fetchWithCache(key, fetchFn) {
      fetchWithCache(key, fetchFn);
      return fetchFn();
    },
  });
  const limiter = createMock<RateLimiterService>({
    add(type, fn, options) {
      add(type, options);
      return fn();
    },
  });
  return new HiroStacksApiClient(cacheService, settingsService, limiter);
}

describe(HiroStacksApiClient.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockResolvedValue({ data: mempoolResponse });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPrincipalMempoolTransactions', () => {
    it('fetches the first page of the v3 principal mempool endpoint', async () => {
      const signal = new AbortController().signal;

      const response = await makeClient().getPrincipalMempoolTransactions(
        principal,
        {},
        { signal }
      );

      expect(response).toEqual(mempoolResponse);
      expect(get).toHaveBeenCalledWith(
        `${mainnet.chain.stacks.url}/extended/v3/principals/${principal}/mempool/transactions?limit=50`,
        { signal }
      );
      expect(add).toHaveBeenCalledWith(RateLimiterType.HiroStacks, {
        priority: hiroApiRequestsPriorityLevels.getPrincipalMempoolTransactions,
        signal,
        throwOnTimeout: true,
      });
      expect(fetchWithCache).toHaveBeenCalledWith(
        [
          'hiro-stacks-get-principal-mempool-transactions',
          principal,
          'start',
          50,
          mainnet.chain.stacks.chainId,
        ],
        expect.any(Function)
      );
    });

    it('passes the cursor and limit through to the request and cache key', async () => {
      const cursor = '1700000000:0xabc';

      await makeClient().getPrincipalMempoolTransactions(principal, { cursor, limit: 20 });

      expect(get).toHaveBeenCalledWith(
        `${mainnet.chain.stacks.url}/extended/v3/principals/${principal}/mempool/transactions?limit=20&cursor=${encodeURIComponent(cursor)}`,
        { signal: undefined }
      );
      expect(fetchWithCache).toHaveBeenCalledWith(
        [
          'hiro-stacks-get-principal-mempool-transactions',
          principal,
          cursor,
          20,
          mainnet.chain.stacks.chainId,
        ],
        expect.any(Function)
      );
    });

    it('bypasses the cache when skipCache is set', async () => {
      await makeClient().getPrincipalMempoolTransactions(principal, {}, { skipCache: true });

      expect(fetchWithCache).not.toHaveBeenCalled();
      expect(get).toHaveBeenCalledTimes(1);
    });
  });
  describe('getTransactionById', () => {
    const txid = '0xabc';

    it('requests the transaction without heavy fields by default', async () => {
      await makeClient().getTransactionById(txid);

      expect(get).toHaveBeenCalledWith(
        `${mainnet.chain.stacks.url}/extended/v3/transactions/${txid}`,
        { signal: undefined }
      );
      expect(fetchWithCache).toHaveBeenCalledWith(
        ['hiro-stacks-get-transaction-by-id', txid, '', mainnet.chain.stacks.chainId],
        expect.any(Function)
      );
    });

    it('requests and caches included heavy fields separately', async () => {
      await makeClient().getTransactionById(txid, { include: ['result', 'post_conditions'] });

      expect(get).toHaveBeenCalledWith(
        `${mainnet.chain.stacks.url}/extended/v3/transactions/${txid}?include=post_conditions,result`,
        { signal: undefined }
      );
      expect(fetchWithCache).toHaveBeenCalledWith(
        [
          'hiro-stacks-get-transaction-by-id',
          txid,
          'post_conditions,result',
          mainnet.chain.stacks.chainId,
        ],
        expect.any(Function)
      );
    });
  });

  describe('getRawTransactionById', () => {
    const txid = '0xabc';
    const rawTxResponse = { raw: '0x80800000000400' };

    it('fetches the raw transaction from the v3 endpoint', async () => {
      get.mockResolvedValue({ data: rawTxResponse });
      const signal = new AbortController().signal;

      const response = await makeClient().getRawTransactionById(txid, { signal });

      expect(response).toEqual(rawTxResponse);
      expect(get).toHaveBeenCalledWith(
        `${mainnet.chain.stacks.url}/extended/v3/transactions/${txid}/raw`,
        { signal }
      );
      expect(add).toHaveBeenCalledWith(RateLimiterType.HiroStacks, {
        priority: hiroApiRequestsPriorityLevels.getRawTransactionById,
        signal,
        throwOnTimeout: true,
      });
      expect(fetchWithCache).toHaveBeenCalledWith(
        ['hiro-stacks-get-raw-transaction-by-id', txid, mainnet.chain.stacks.chainId],
        expect.any(Function)
      );
    });

    it('bypasses the cache when skipCache is set', async () => {
      get.mockResolvedValue({ data: rawTxResponse });

      await makeClient().getRawTransactionById(txid, { skipCache: true });

      expect(fetchWithCache).not.toHaveBeenCalled();
    });
  });
});
