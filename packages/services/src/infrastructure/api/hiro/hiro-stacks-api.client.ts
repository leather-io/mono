import {
  MempoolTransactionListResponse,
  NonFungibleTokenHoldingsList,
} from '@stacks/stacks-blockchain-api-types';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';

import { DEFAULT_LIST_LIMIT } from '@leather.io/constants';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { selectStacksApiUrl, selectStacksChainId } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import { HiroMultiPageRequest, fetchHiroPages } from './hiro-multi-page';
import { hiroApiRequestsPriorityLevels } from './hiro-request-priorities';
import {
  HiroAddressBalanceResponse,
  HiroAddressFtBalancesResponse,
  HiroAddressStxBalanceResponse,
  HiroAddressTransaction,
  HiroAddressTransactionsResponse,
  HiroMempoolTransactionListResponse,
  HiroNftHolding,
  HiroNftMetadataResponse,
  HiroPageRequest,
  HiroTransactionEvent,
  HiroTransactionEventsResponse,
} from './hiro-stacks-api.types';
import { filterVerboseUnusedTransactionWithTransfersData } from './hiro-stacks-api.utils';

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
      }
    );
  }

  public async getAddressStxBalance(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroAddressStxBalanceResponse> {
    return await this.cache.fetchWithCache(
      [
        'hiro-stacks-get-address-stx-balance',
        address,
        selectStacksChainId(this.settings.getSettings()),
      ],
      async () => {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<HiroAddressStxBalanceResponse>(
              `${selectStacksApiUrl(this.settings.getSettings())}/extended/v2/addresses/${address}/balances/stx`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getAccountBalance,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data;
      }
    );
  }

  public async getAddressFtBalances(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroAddressFtBalancesResponse> {
    return await this.cache.fetchWithCache(
      [
        'hiro-stacks-get-address-ft-balances',
        address,
        selectStacksChainId(this.settings.getSettings()),
      ],
      async () => {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<HiroAddressFtBalancesResponse>(
              `${selectStacksApiUrl(this.settings.getSettings())}/extended/v2/addresses/${address}/balances/ft`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getAccountBalance,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data;
      }
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
      }
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
      }
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
      }
    );
  }

  public async getNftMetadata(
    principal: string,
    tokenId: number,
    signal?: AbortSignal
  ): Promise<HiroNftMetadataResponse | null> {
    return await this.cache.fetchWithCache(
      ['hiro-stacks-get-nft-metadata', principal, selectStacksChainId(this.settings.getSettings())],
      async () =>
        await this.limiter.add(
          RateLimiterType.HiroStacks,
          async () => {
            try {
              const res = await this._axios.get<HiroNftMetadataResponse>(
                `${selectStacksApiUrl(this.settings.getSettings())}/metadata/v1/nft/${principal}/${tokenId}`,
                { signal }
              );
              return res.data;
            } catch (error) {
              if (
                error instanceof AxiosError &&
                (error.request?.status === 404 || error.request?.status === 422)
              )
                return null;
              throw error;
            }
          },
          {
            priority: hiroApiRequestsPriorityLevels.getNftMetadata,
            signal,
            throwOnTimeout: true,
          }
        )
    );
  }

  public async getNftHoldings(principal: string, signal?: AbortSignal): Promise<HiroNftHolding[]> {
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
      }
    );
  }
}
