import { FtMetadataResponse, NftMetadataResponse } from '@hirosystems/token-metadata-api-client';
import {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressTransactionWithTransfers,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransaction,
  MempoolTransactionListResponse,
  NonFungibleTokenHolding,
  NonFungibleTokenHoldingsList,
  Transaction,
  TransactionEvent,
} from '@stacks/stacks-blockchain-api-types';
import axios, { AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';

import { DEFAULT_LIST_LIMIT } from '@leather.io/constants';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { selectStacksApiUrl, selectStacksChainId } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
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
export type HiroNftHolding = NonFungibleTokenHolding;

@injectable()
export class HiroStacksApiClient {
  private readonly _axios: AxiosInstance;

  constructor(
    @inject(Types.CacheService) private readonly cache: HttpCacheService,
    @inject(Types.SettingsService) private readonly settings: SettingsService,
    private readonly limiter: RateLimiterService
  ) {
    this._axios = axios.create({
      headers: {
        'X-Partner': 'Leather',
      },
      timeout: 30000,
    });
  }

  public async getAddressBalances(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroAddressBalanceResponse> {
    return await this.cache.fetchWithCache(
      [
        'hiro-stacks-get-address-balances',
        address,
        selectStacksChainId(this.settings.getSettings()),
      ],
      async () => {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<HiroAddressBalanceResponse>(
              `${selectStacksApiUrl(this.settings.getSettings())}/extended/v1/address/${address}/balances`,
              {
                signal,
              }
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

  private async getAddressTransactionsPage(
    address: string,
    page: HiroPageRequest,
    signal?: AbortSignal
  ): Promise<HiroAddressTransactionsResponse> {
    const pageParams = new URLSearchParams({
      limit: page.limit.toString(),
      offset: page.offset.toString(),
    });
    return await this.cache.fetchWithCache(
      [
        'hiro-stacks-get-address-transactions',
        selectStacksChainId(this.settings.getSettings()),
        address,
        pageParams.toString(),
      ],
      async () => {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<HiroAddressTransactionsResponse>(
              `${selectStacksApiUrl(this.settings.getSettings())}/extended/v2/addresses/${address}/transactions?${pageParams.toString()}`,
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

  public async getAddressTransactions(
    address: string,
    pages: HiroMultiPageRequest,
    signal?: AbortSignal
  ): Promise<HiroAddressTransaction[]> {
    return fetchHiroPages<HiroAddressTransaction>(
      page => this.getAddressTransactionsPage(address, page, signal),
      {
        limit: 50,
        pagesRequest: pages,
      }
    );
  }

  private async getTransactionEventsPage(
    address: string,
    page: HiroPageRequest,
    signal?: AbortSignal
  ): Promise<HiroTransactionEventsResponse> {
    const pageParams = new URLSearchParams({
      limit: page.limit.toString(),
      offset: page.offset.toString(),
    });
    return await this.cache.fetchWithCache(
      [
        'hiro-stacks-get-transaction-events',
        selectStacksChainId(this.settings.getSettings()),
        address,
        pageParams.toString(),
      ],
      async () => {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<HiroTransactionEventsResponse>(
              `${selectStacksApiUrl(this.settings.getSettings())}/extended/v1/address/${address}/assets?${pageParams.toString()}`,
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

  public async getTransactionEvents(
    address: string,
    pages: HiroMultiPageRequest,
    signal?: AbortSignal
  ): Promise<HiroTransactionEvent[]> {
    return fetchHiroPages<HiroTransactionEvent>(
      page => this.getTransactionEventsPage(address, page, signal),
      {
        limit: 100,
        pagesRequest: pages,
      }
    );
  }

  public async getAddressMempoolTransactions(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroMempoolTransactionListResponse> {
    return await this.cache.fetchWithCache(
      [
        'hiro-stacks-get-address-mempool-transactions',
        address,
        selectStacksChainId(this.settings.getSettings()),
      ],
      async () => {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<MempoolTransactionListResponse>(
              `${selectStacksApiUrl(this.settings.getSettings())}/extended/v1/tx/mempool?address=${address}&limit=${DEFAULT_LIST_LIMIT}`,
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

  public async getNonFungibleTokenMetadata(
    principal: string,
    tokenId: number,
    signal?: AbortSignal
  ): Promise<HiroNftMetadataResponse> {
    return await this.cache.fetchWithCache(
      [
        'hiro-stacks-get-nft-token-metadata',
        principal,
        selectStacksChainId(this.settings.getSettings()),
      ],
      async () => {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<HiroNftMetadataResponse>(
              `${selectStacksApiUrl(this.settings.getSettings())}/metadata/v1/nft/${principal}/${tokenId}`,
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

  public async getNonFungibleHoldings(
    principal: string,
    signal?: AbortSignal
  ): Promise<HiroNftHolding[]> {
    const pageParams = new URLSearchParams({
      limit: '100',
      offset: '0',
    });
    return await this.cache.fetchWithCache(
      ['hiro-stacks-get-nft-holdings', principal, selectStacksChainId(this.settings.getSettings())],
      async () => {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<NonFungibleTokenHoldingsList>(
              `${selectStacksApiUrl(this.settings.getSettings())}/extended/v1/tokens/nft/holdings?principal=${principal}&${pageParams.toString()}`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getNftHoldings,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data.results;
      },
      { ttl: HttpCacheTimeMs.tenSeconds }
    );
  }
}
