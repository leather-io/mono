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
import type {
  HiroPrincipalMempoolTransactionsResponse,
  HiroPrincipalNftBalancesResponse,
} from './hiro-stacks-api.types';

const principal = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const mainnet = defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.mainnet];

const mempoolResponse: HiroPrincipalMempoolTransactionsResponse = {
  total: 1,
  limit: 50,
  cursor: { next: null, previous: null, current: '1700000000:0xabc' },
  results: [createTestPrincipalMempoolTokenTransferTx({ tx_id: '0xabc' })],
};

const get = vi.fn();
const fetchWithCache =
  vi.fn<
    (
      key: HttpCacheKeyArray,
      fetchFn: () => Promise<unknown>,
      options?: { skipCache?: boolean }
    ) => void
  >();
const add = vi.fn();

function makeClient() {
  vi.spyOn(axios, 'create').mockReturnValue(createMock<AxiosInstance>({ get }));
  const settingsService: SettingsService = {
    getSettings: () => ({ network: mainnet, quoteCurrency: 'USD', assetVisibility: {} }),
  };
  const cacheService = createMock<HttpCacheService>({
    fetchWithCache(key, fetchFn, options) {
      fetchWithCache(key, fetchFn, options);
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
        expect.any(Function),
        { skipCache: undefined }
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
        expect.any(Function),
        { skipCache: undefined }
      );
    });

    it('bypasses the cache when skipCache is set', async () => {
      await makeClient().getPrincipalMempoolTransactions(principal, {}, { skipCache: true });

      expect(fetchWithCache).toHaveBeenCalledWith(expect.any(Array), expect.any(Function), {
        skipCache: true,
      });
      expect(get).toHaveBeenCalledTimes(1);
    });
  });
  describe('getPrincipalNftBalances', () => {
    const assetIdentifier =
      'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild::The-Explorer-Guild';
    const firstPage: HiroPrincipalNftBalancesResponse = {
      total: 2,
      limit: 200,
      cursor: {
        next: `${assetIdentifier}:0x0102`,
        previous: null,
        current: `${assetIdentifier}:0x0101`,
      },
      results: [{ asset_identifier: assetIdentifier, value: { hex: '0x0101', repr: 'u1' } }],
    };
    const secondPage: HiroPrincipalNftBalancesResponse = {
      total: 2,
      limit: 200,
      cursor: {
        next: null,
        previous: `${assetIdentifier}:0x0101`,
        current: `${assetIdentifier}:0x0102`,
      },
      results: [{ asset_identifier: assetIdentifier, value: { hex: '0x0102', repr: 'u2' } }],
    };

    function mockTwoPages() {
      get.mockResolvedValueOnce({ data: firstPage }).mockResolvedValueOnce({ data: secondPage });
    }

    it('follows the cursor across pages of the v3 principal NFT balances endpoint', async () => {
      mockTwoPages();
      const signal = new AbortController().signal;

      const balances = await makeClient().getPrincipalNftBalances(
        principal,
        { maxPages: 10 },
        { signal }
      );

      expect(balances).toEqual([...firstPage.results, ...secondPage.results]);
      expect(get).toHaveBeenNthCalledWith(
        1,
        `${mainnet.chain.stacks.url}/extended/v3/principals/${principal}/balances/nft?limit=200`,
        { signal }
      );
      expect(get).toHaveBeenNthCalledWith(
        2,
        `${mainnet.chain.stacks.url}/extended/v3/principals/${principal}/balances/nft?limit=200&cursor=${encodeURIComponent(`${assetIdentifier}:0x0102`)}`,
        { signal }
      );
      expect(add).toHaveBeenCalledWith(RateLimiterType.HiroStacks, {
        priority: hiroApiRequestsPriorityLevels.getPrincipalNftBalances,
        signal,
        throwOnTimeout: true,
      });
      expect(fetchWithCache).toHaveBeenNthCalledWith(
        1,
        [
          'hiro-stacks-get-principal-nft-balances',
          principal,
          'all',
          'start',
          200,
          mainnet.chain.stacks.chainId,
        ],
        expect.any(Function),
        { skipCache: undefined }
      );
      expect(fetchWithCache).toHaveBeenNthCalledWith(
        2,
        [
          'hiro-stacks-get-principal-nft-balances',
          principal,
          'all',
          `${assetIdentifier}:0x0102`,
          200,
          mainnet.chain.stacks.chainId,
        ],
        expect.any(Function),
        { skipCache: undefined }
      );
    });

    it('filters by asset identifier in the request and cache key', async () => {
      get.mockResolvedValueOnce({ data: secondPage });

      await makeClient().getPrincipalNftBalances(principal, { assetIdentifier, maxPages: 1 });

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith(
        `${mainnet.chain.stacks.url}/extended/v3/principals/${principal}/balances/nft?limit=200&asset_identifier=${encodeURIComponent(assetIdentifier)}`,
        { signal: undefined }
      );
      expect(fetchWithCache).toHaveBeenCalledWith(
        [
          'hiro-stacks-get-principal-nft-balances',
          principal,
          assetIdentifier,
          'start',
          200,
          mainnet.chain.stacks.chainId,
        ],
        expect.any(Function),
        { skipCache: undefined }
      );
    });

    it('bypasses the cache when skipCache is set', async () => {
      mockTwoPages();

      await makeClient().getPrincipalNftBalances(principal, { maxPages: 10 }, { skipCache: true });

      expect(fetchWithCache).toHaveBeenCalledTimes(2);
      expect(fetchWithCache).toHaveBeenNthCalledWith(1, expect.any(Array), expect.any(Function), {
        skipCache: true,
      });
      expect(fetchWithCache).toHaveBeenNthCalledWith(2, expect.any(Array), expect.any(Function), {
        skipCache: true,
      });
      expect(get).toHaveBeenCalledTimes(2);
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
        expect.any(Function),
        { skipCache: undefined }
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
        expect.any(Function),
        { skipCache: undefined }
      );
    });
  });
});
