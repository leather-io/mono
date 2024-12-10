import { FtMetadataResponse } from '@hirosystems/token-metadata-api-client';
import {
  AddressBalanceResponse,
  AddressTransactionsListResponse,
  MempoolTransactionListResponse,
} from '@stacks/stacks-blockchain-api-types';
import axios from 'axios';

import { DEFAULT_LIST_LIMIT } from '@leather.io/constants';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { NetworkSettingsService } from '../../settings/network-settings.service';
import { hiroApiRequestsPriorityLevels } from './hiro-request-priorities';

export type HiroAddressTransactionsListResponse = AddressTransactionsListResponse;
export type HiroAddressBalanceResponse = AddressBalanceResponse;
export type HiroMempoolTransactionListResponse = MempoolTransactionListResponse;
export type HiroFtMetadataResponse = FtMetadataResponse;

export interface HiroStacksApiClient {
  getAddressBalances(address: string, signal?: AbortSignal): Promise<HiroAddressBalanceResponse>;
  getAddressConfirmedTransactions(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroAddressTransactionsListResponse>;
  getAddressMempoolTransactions(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroMempoolTransactionListResponse>;
  getFungibleTokenMetadata(
    principal: string,
    signal?: AbortSignal
  ): Promise<HiroFtMetadataResponse>;
}

export function createHiroStacksApiClient(
  cache: HttpCacheService,
  network: NetworkSettingsService,
  limiter: RateLimiterService
): HiroStacksApiClient {
  async function getAddressBalances(address: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      ['hiro-stacks-get-address-balances', address, network.getConfig().chain.stacks.chainId],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<HiroAddressBalanceResponse>(
              `${network.getConfig().chain.stacks.url}/extended/v1/address/${address}/balances`,
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
      { ttl: HttpCacheTimeMs.twoMinutes }
    );
  }

  async function getAddressConfirmedTransactions(address: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      ['hiro-stacks-get-address-transactions', address, network.getConfig().chain.stacks.chainId],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<HiroAddressTransactionsListResponse>(
              `${network.getConfig().chain.stacks.url}/extended/v2/addresses/${address}/transactions?limit=${DEFAULT_LIST_LIMIT}`,
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
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async function getAddressMempoolTransactions(address: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      [
        'hiro-stacks-get-address-mempool-transactions',
        address,
        network.getConfig().chain.stacks.chainId,
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<MempoolTransactionListResponse>(
              `${network.getConfig().chain.stacks.url}/extended/v1/tx/mempool?address=${address}&limit=${DEFAULT_LIST_LIMIT}`,
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
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async function getFungibleTokenMetadata(principal: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      ['hiro-stacks-get-ft-token-metadata', principal, network.getConfig().chain.stacks.chainId],
      async () => {
        const res = await limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            axios.get<HiroFtMetadataResponse>(
              `${network.getConfig().chain.stacks.url}/metadata/v1/ft/${principal}`,
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

  return {
    getAddressConfirmedTransactions,
    getAddressBalances,
    getAddressMempoolTransactions,
    getFungibleTokenMetadata,
  };
}
