import {
  MempoolTransactionListResponse,
  NonFungibleTokenHoldingsList,
} from '@stacks/stacks-blockchain-api-types';
import { ClarityValue, cvToHex, hexToCV } from '@stacks/transactions';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';

import { DEFAULT_LIST_LIMIT } from '@leather.io/constants';
import { generateRandomStacksAddress } from '@leather.io/stacks';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { selectStacksApiUrl, selectStacksChainId } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import { ApiRequestOptions } from '../types';
import { HiroMultiPageRequest, fetchHiroPages } from './hiro-multi-page';
import { hiroApiRequestsPriorityLevels } from './hiro-request-priorities';
import {
  CallReadOnlyFunctionArgs,
  HiroAddressBalanceResponse,
  HiroAddressFtBalancesResponse,
  HiroAddressStxBalanceResponse,
  HiroAddressTransaction,
  HiroAddressTransactionsResponse,
  HiroMempoolTransactionListResponse,
  HiroMetadata,
  HiroNftHolding,
  HiroPageRequest,
  HiroReadOnlyFunctionResponse,
  HiroServerStatusResponse,
  HiroStacksMempoolTransaction,
  HiroStacksTransaction,
  HiroTransactionEvent,
  HiroTransactionEventsResponse,
  HiroTransactionFeeEstimateResponse,
} from './hiro-stacks-api.types';
import { filterVerboseUnusedTransactionWithTransfersData } from './hiro-stacks-api.utils';

interface HiroStacksBlock {
  height: number;
  block_time: number;
}

@injectable()
export class HiroStacksApiClient {
  private readonly _axios: AxiosInstance;
  private readonly _randomStacksAddress = generateRandomStacksAddress();

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
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroAddressBalanceResponse> {
    const fetchFn = async () => {
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
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-address-balances',
            address,
            selectStacksChainId(this.settings.getSettings()),
          ],
          fetchFn
        );
  }

  public async getAddressStxBalance(
    address: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroAddressStxBalanceResponse> {
    const fetchFn = async () => {
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
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-address-stx-balance',
            address,
            selectStacksChainId(this.settings.getSettings()),
          ],
          fetchFn
        );
  }

  public async getAddressFtBalances(
    address: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroAddressFtBalancesResponse> {
    const fetchFn = async () => {
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
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-address-ft-balances',
            address,
            selectStacksChainId(this.settings.getSettings()),
          ],
          fetchFn
        );
  }

  private async getAddressTransactionsPage(
    address: string,
    page: HiroPageRequest,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroAddressTransactionsResponse> {
    const pageParams = new URLSearchParams({
      limit: page.limit.toString(),
      offset: page.offset.toString(),
    });
    const fetchFn = async () => {
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
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-address-transactions',
            selectStacksChainId(this.settings.getSettings()),
            address,
            pageParams.toString(),
          ],
          fetchFn
        );
  }

  public async getAddressTransactions(
    address: string,
    pages: HiroMultiPageRequest,
    { signal }: ApiRequestOptions = {}
  ): Promise<HiroAddressTransaction[]> {
    return fetchHiroPages<HiroAddressTransaction>(
      page => this.getAddressTransactionsPage(address, page, { signal }),
      {
        limit: 50,
        pagesRequest: pages,
      }
    );
  }

  private async getTransactionEventsPage(
    address: string,
    page: HiroPageRequest,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroTransactionEventsResponse> {
    const pageParams = new URLSearchParams({
      limit: page.limit.toString(),
      offset: page.offset.toString(),
    });
    const fetchFn = async () => {
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
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-transaction-events',
            selectStacksChainId(this.settings.getSettings()),
            address,
            pageParams.toString(),
          ],
          fetchFn
        );
  }

  public async getTransactionEvents(
    address: string,
    pages: HiroMultiPageRequest,
    { signal }: ApiRequestOptions = {}
  ): Promise<HiroTransactionEvent[]> {
    return fetchHiroPages<HiroTransactionEvent>(
      page => this.getTransactionEventsPage(address, page, { signal }),
      {
        limit: 100,
        pagesRequest: pages,
      }
    );
  }

  public async getAddressMempoolTransactions(
    address: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroMempoolTransactionListResponse> {
    const fetchFn = async () => {
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
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-address-mempool-transactions',
            address,
            selectStacksChainId(this.settings.getSettings()),
          ],
          fetchFn
        );
  }

  public async getTransactionById(
    txid: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroStacksTransaction | HiroStacksMempoolTransaction | null> {
    const fetchFn = async () => {
      try {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          () =>
            this._axios.get<HiroStacksTransaction | HiroStacksMempoolTransaction>(
              `${selectStacksApiUrl(this.settings.getSettings())}/extended/v1/tx/${txid}`,
              { signal }
            ),
          {
            priority: hiroApiRequestsPriorityLevels.getTransactionById,
            signal,
            throwOnTimeout: true,
          }
        );
        return res.data;
      } catch (error) {
        if (
          error instanceof AxiosError &&
          (error.request?.status === 404 || error.request?.status === 422)
        ) {
          return null;
        }
        throw error;
      }
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-transaction-by-id',
            txid,
            selectStacksChainId(this.settings.getSettings()),
          ],
          fetchFn
        );
  }

  public async getNftMetadata(
    principal: string,
    tokenId: number,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroMetadata | null> {
    const fetchFn = async () => {
      try {
        const res = await this.limiter.add(
          RateLimiterType.HiroStacks,
          async () =>
            this._axios.get<HiroMetadata>(
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
      } catch (error) {
        if (
          error instanceof AxiosError &&
          (error.request?.status === 404 || error.request?.status === 422)
        ) {
          return null;
        }
        throw error;
      }
    };

    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-nft-metadata',
            principal,
            tokenId,
            selectStacksChainId(this.settings.getSettings()),
          ],
          fetchFn
        );
  }

  public async getNftHoldings(
    principal: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroNftHolding[]> {
    const limit = 50;

    const fetchPage = async function (this: HiroStacksApiClient, page: HiroPageRequest) {
      const res = await this.limiter.add(
        RateLimiterType.HiroStacks,
        () =>
          this._axios.get<NonFungibleTokenHoldingsList>(
            `${selectStacksApiUrl(this.settings.getSettings())}/extended/v1/tokens/nft/holdings?principal=${principal}&limit=${page.limit}&offset=${page.offset}`,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.getNftHoldings,
          signal,
          throwOnTimeout: true,
        }
      );
      return res.data;
    }.bind(this);

    async function fetchFn() {
      return fetchHiroPages(fetchPage, {
        limit,
        pagesRequest: { allPages: true },
      });
    }

    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-nft-holdings',
            principal,
            selectStacksChainId(this.settings.getSettings()),
          ],
          fetchFn
        );
  }

  public async callReadOnlyFunction(
    {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      senderAddress,
      tip = 'latest',
    }: CallReadOnlyFunctionArgs,
    { signal, skipCache }: ApiRequestOptions
  ): Promise<ClarityValue> {
    const body = {
      sender: senderAddress ?? this._randomStacksAddress,
      arguments: functionArgs.map(arg => cvToHex(arg)),
    };
    const fetchFn = async () => {
      const res = await this.limiter.add(
        RateLimiterType.HiroStacks,
        () =>
          this._axios.post<HiroReadOnlyFunctionResponse>(
            `${selectStacksApiUrl(this.settings.getSettings())}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}?tip=${tip}`,
            body,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.callReadOnlyFunction,
          signal,
          throwOnTimeout: true,
        }
      );
      if (!res.data.okay) {
        throw new Error(res.data.cause);
      }
      return hexToCV(res.data.result);
    };

    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-call-read-only-function',
            contractAddress,
            contractName,
            functionName,
            body.arguments,
          ],
          fetchFn
        );
  }

  public async getTransferFeeRate({ signal, skipCache }: ApiRequestOptions = {}): Promise<number> {
    const fetchFn = async () => {
      const res = await this.limiter.add(
        RateLimiterType.HiroStacks,
        () =>
          this._axios.get<number>(
            `${selectStacksApiUrl(this.settings.getSettings())}/v2/fees/transfer`,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.getTransferFeeRate,
          signal,
          throwOnTimeout: true,
        }
      );
      return res.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          ['hiro-stacks-get-transfer-fee-rate', selectStacksChainId(this.settings.getSettings())],
          fetchFn
        );
  }

  public async getTransactionFeeEstimate(
    txPayload: string,
    txByteLength: number | null,
    { signal, skipCache }: ApiRequestOptions
  ): Promise<HiroTransactionFeeEstimateResponse> {
    const fetchFn = async () => {
      const res = await this.limiter.add(
        RateLimiterType.HiroStacks,
        () =>
          this._axios.post<HiroTransactionFeeEstimateResponse>(
            `${selectStacksApiUrl(this.settings.getSettings())}/v2/fees/transaction`,
            {
              estimated_len: txByteLength,
              transaction_payload: txPayload,
            },
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.callReadOnlyFunction,
          signal,
          throwOnTimeout: true,
        }
      );
      return res.data;
    };

    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          // shouldnt need to add entire txPayload to cache key, estimatedLen + sufficiently
          // low cache times should ensure acceptable refetching
          ['hiro-stacks-get-transaction-fee-estimate', txByteLength],
          fetchFn
        );
  }

  public async getApiStatus({
    signal,
    skipCache,
  }: ApiRequestOptions = {}): Promise<HiroServerStatusResponse> {
    const fetchFn = async () => {
      const res = await this.limiter.add(
        RateLimiterType.HiroStacks,
        () =>
          this._axios.get<HiroServerStatusResponse>(
            `${selectStacksApiUrl(this.settings.getSettings())}/extended`,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.getApiStatus,
          signal,
          throwOnTimeout: true,
        }
      );
      return res.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          ['hiro-stacks-get-api-status', selectStacksChainId(this.settings.getSettings())],
          fetchFn
        );
  }

  public async getBlockByHeight(
    height: number,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<HiroStacksBlock> {
    const fetchFn = async () => {
      const res = await this.limiter.add(
        RateLimiterType.HiroStacks,
        () =>
          this._axios.get<HiroStacksBlock>(
            `${selectStacksApiUrl(this.settings.getSettings())}/extended/v2/blocks/${height}`,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.getAccountTransactions,
          signal,
          throwOnTimeout: true,
        }
      );
      return res.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          [
            'hiro-stacks-get-block-by-height',
            height,
            selectStacksChainId(this.settings.getSettings()),
          ],
          fetchFn
        );
  }
}
