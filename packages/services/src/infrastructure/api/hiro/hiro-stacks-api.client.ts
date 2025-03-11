import { FtMetadataResponse, NftMetadataResponse } from '@hirosystems/token-metadata-api-client';
import {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressTransactionWithTransfers,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransaction,
  MempoolTransactionListResponse,
  Transaction,
  TransactionEvent,
} from '@stacks/stacks-blockchain-api-types';
import axios from 'axios';

import { DEFAULT_LIST_LIMIT } from '@leather.io/constants';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { selectStacksApiUrl, selectStacksChainId } from '../../settings/settings.selectors';
import { SettingsService } from '../../settings/settings.service';
import { HiroMultiPageRequest, fetchHiroPages } from './hiro-multi-page';
import { hiroApiRequestsPriorityLevels } from './hiro-request-priorities';
import { filterVerboseUnusedTransactionWithTransfersData } from './hiro-stacks-api.utils';

export interface HiroPageRequest {
  limit: number;
  offset: number;
}
export interface HiroPageResponse<T> {
  limit: number;
  offset: number;
  total: number;
  results: T[];
}

export type HiroAddressTransactionsResponse = AddressTransactionsWithTransfersListResponse;
export type HiroAddressTransactionWithTransfers = AddressTransactionWithTransfers;
export type HiroAddressTransaction = AddressTransactionWithTransfers;
export type HiroAddressBalanceResponse = AddressBalanceResponse;
export type HiroMempoolTransactionListResponse = MempoolTransactionListResponse;
export type HiroFtMetadataResponse = FtMetadataResponse;
export type HiroNftMetadataResponse = NftMetadataResponse;
export type HiroTransactionEvent = TransactionEvent;
export type HiroTransactionEventsResponse = AddressAssetsListResponse;
export type HiroStacksTransaction = Transaction;
export type HiroStacksMempoolTransaction = MempoolTransaction;

export interface HiroStacksApiClient {
  getAddressBalances(address: string, signal?: AbortSignal): Promise<HiroAddressBalanceResponse>;
  getAddressTransactions(
    address: string,
    pages: HiroMultiPageRequest,
    signal?: AbortSignal
  ): Promise<HiroAddressTransaction[]>;
  getTransactionEvents(
    address: string,
    pages: HiroMultiPageRequest,
    signal?: AbortSignal
  ): Promise<HiroTransactionEvent[]>;
  getAddressMempoolTransactions(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroMempoolTransactionListResponse>;
  getFungibleTokenMetadata(
    principal: string,
    signal?: AbortSignal
  ): Promise<HiroFtMetadataResponse>;
  getNonFungibleTokenMetadata(
    principal: string,
    tokenId: number,
    signal?: AbortSignal
  ): Promise<HiroNftMetadataResponse>;
}

export function createHiroStacksApiClient(
  cache: HttpCacheService,
  settings: SettingsService,
  limiter: RateLimiterService
): HiroStacksApiClient {
  async function getAddressBalances(address: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      ['hiro-stacks-get-address-balances', address, selectStacksChainId(settings.getSettings())],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<HiroAddressBalanceResponse>(
              `${selectStacksApiUrl(settings.getSettings())}/extended/v1/address/${address}/balances`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getAccountBalance,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.tenSeconds }
    );
  }

  async function _getAddressTransactionsPage(
    address: string,
    page: HiroPageRequest,
    signal?: AbortSignal
  ): Promise<HiroAddressTransactionsResponse> {
    const pageParams = new URLSearchParams({
      limit: page.limit.toString(),
      offset: page.offset.toString(),
    });
    return await cache.fetchWithCache(
      [
        'hiro-stacks-get-address-transactions',
        selectStacksChainId(settings.getSettings()),
        address,
        pageParams.toString(),
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<HiroAddressTransactionsResponse>(
              `${selectStacksApiUrl(settings.getSettings())}/extended/v2/addresses/${address}/transactions?${pageParams.toString()}`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getAccountTransactions,
            signal,
            throwOnTimeout: true,
          }
        );
        return {
          ...res.data,
          results: res.data.results.map(filterVerboseUnusedTransactionWithTransfersData),
        };
      },
      { ttl: HttpCacheTimeMs.tenSeconds }
    );
  }

  async function getAddressTransactions(
    address: string,
    pages: HiroMultiPageRequest,
    signal?: AbortSignal
  ): Promise<HiroAddressTransaction[]> {
    return fetchHiroPages<HiroAddressTransaction>(
      page => _getAddressTransactionsPage(address, page, signal),
      {
        limit: 50,
        pagesRequest: pages,
      }
    );
  }

  async function _getTransactionEventsPage(
    address: string,
    page: HiroPageRequest,
    signal?: AbortSignal
  ): Promise<HiroTransactionEventsResponse> {
    const pageParams = new URLSearchParams({
      limit: page.limit.toString(),
      offset: page.offset.toString(),
    });
    return await cache.fetchWithCache(
      [
        'hiro-stacks-get-transaction-events',
        selectStacksChainId(settings.getSettings()),
        address,
        pageParams.toString(),
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<HiroTransactionEventsResponse>(
              `${selectStacksApiUrl(settings.getSettings())}/extended/v1/address/${address}/assets?${pageParams.toString()}`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getAccountTransactions,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.tenSeconds }
    );
  }

  async function getTransactionEvents(
    address: string,
    pages: HiroMultiPageRequest,
    signal?: AbortSignal
  ): Promise<HiroTransactionEvent[]> {
    return fetchHiroPages<HiroTransactionEvent>(
      page => _getTransactionEventsPage(address, page, signal),
      {
        limit: 100,
        pagesRequest: pages,
      }
    );
  }

  async function getAddressMempoolTransactions(address: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      [
        'hiro-stacks-get-address-mempool-transactions',
        address,
        selectStacksChainId(settings.getSettings()),
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<MempoolTransactionListResponse>(
              `${selectStacksApiUrl(settings.getSettings())}/extended/v1/tx/mempool?address=${address}&limit=${DEFAULT_LIST_LIMIT}`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getAddressMempoolTransactions,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }

  async function getFungibleTokenMetadata(principal: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      ['hiro-stacks-get-ft-token-metadata', principal, selectStacksChainId(settings.getSettings())],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<HiroFtMetadataResponse>(
              `${selectStacksApiUrl(settings.getSettings())}/metadata/v1/ft/${principal}`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getFtMetadata,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.infinity }
    );
  }

  async function getNonFungibleTokenMetadata(
    principal: string,
    tokenId: number,
    signal?: AbortSignal
  ) {
    return await cache.fetchWithCache(
      [
        'hiro-stacks-get-nft-token-metadata',
        principal,
        selectStacksChainId(settings.getSettings()),
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<HiroNftMetadataResponse>(
              `${selectStacksApiUrl(settings.getSettings())}/metadata/v1/nft/${principal}/${tokenId}`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getNftMetadata,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.infinity }
    );
  }

  return {
    getAddressTransactions,
    getTransactionEvents,
    getAddressBalances,
    getAddressMempoolTransactions,
    getFungibleTokenMetadata,
    getNonFungibleTokenMetadata,
  };
}
