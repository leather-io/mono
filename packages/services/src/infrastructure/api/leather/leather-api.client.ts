import { inject, injectable } from 'inversify';
import createClient from 'openapi-fetch';
import { v4 as uuidv4 } from 'uuid';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import type { HistoricalPeriod, SupportedBlockchains } from '@leather.io/models';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import type { Environment } from '../../environment';
import { leatherApiPriorities } from '../../rate-limiter/leather-rate-limiter';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { selectBitcoinNetwork } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import { ApiRequestOptions } from '../types';
import { LeatherApiError } from './leather-api.error';
import { LeatherApiPageRequest, getPageRequestQueryParams } from './leather-api.pagination';
import { paths } from './leather-api.types';

export type LeatherApiBitcoinTransaction =
  paths['/v1/transactions/{descriptor}']['get']['responses'][200]['content']['application/json']['data'][number];
export type LeatherApiSip10Token =
  paths['/v1/tokens/sip10s/{principal}']['get']['responses']['200']['content']['application/json'];
export type LeatherApiUtxo =
  paths['/v1/utxos/{descriptor}']['get']['responses'][200]['content']['application/json'][number];
export type LeatherApiTokenPriceHistory =
  paths['/v1/market/prices/native/{symbol}/history']['get']['responses'][200]['content']['application/json'];
export type LeatherApiLocale = Required<
  NonNullable<paths['/v1/tokens/native/{symbol}/description']['get']['parameters']['query']>
>['locale'];
export type LeatherApiSwapDex =
  paths['/v1/swap/dexes']['get']['responses'][200]['content']['application/json'][string];
export type LeatherApiProtocol =
  paths['/v1/protocols']['get']['responses'][200]['content']['application/json'][string];
export type LeatherApiAppConfig =
  paths['/v1/app-config']['get']['responses'][200]['content']['application/json'];
type LeatherApiBitcoinFeeRates =
  paths['/v1/market/bitcoin/fees']['get']['responses'][200]['content']['application/json'];
export type LeatherApiBitflowPool = Extract<
  paths['/v1/defi/bitflow/pools']['get']['responses'][200]['content']['application/json'],
  { format: 'list' }
>['data'][number];
type LeatherApiZestReserve =
  paths['/v1/defi/zest/reserves/{principal}']['get']['responses'][200]['content']['application/json'];
type LeatherApiStackingDaoRates =
  paths['/v1/defi/stacking-dao/rates']['get']['responses'][200]['content']['application/json'];
export type LeatherApiPriceMapEntry = Extract<
  paths['/v1/market/prices/native']['get']['responses'][200]['content']['application/json'],
  { format: 'map' }
>['data'][string];
export type LeatherApiTokenAnalyticsMapEntry = Extract<
  paths['/v1/analytics/native']['get']['responses'][200]['content']['application/json'],
  { format: 'map' }
>['data'][string];

interface ProposeMultisigTransactionOptions extends ApiRequestOptions {
  baseUrl?: string;
}

function createLeatherOpenApiClient(baseUrl: string, clientId: string) {
  const client = createClient<paths>({ baseUrl });
  client.use({
    onRequest({ request }) {
      request.headers.set('X-Client-ID', clientId);
      return request;
    },
    onResponse({ response }) {
      if (!response.ok) {
        throw new LeatherApiError(response.url, response.status, response.statusText);
      }
    },
  });
  return client;
}

@injectable()
export class LeatherApiClient {
  private readonly client;
  private readonly clientId = uuidv4();

  constructor(
    @inject(Types.CacheService) private readonly cacheService: HttpCacheService,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.Environment) env: Environment,
    private readonly rateLimiter: RateLimiterService
  ) {
    const baseUrl =
      env.environment === 'production'
        ? LEATHER_API_URL_PRODUCTION
        : (env.leatherApiUrl ?? LEATHER_API_URL_STAGING);
    this.client = createLeatherOpenApiClient(baseUrl, this.clientId);
  }

  async fetchUtxos(
    descriptor: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<LeatherApiUtxo[]> {
    const network = this.settingsService.getSettings().network.chain.bitcoin.bitcoinNetwork;
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET(`/v1/utxos/{descriptor}`, {
            params: { path: { descriptor }, query: { network } },
            signal,
          }),
        {
          priority: leatherApiPriorities.utxos,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-utxos', network, descriptor], fetchFn);
  }

  async fetchUtxosByAddress(
    address: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<LeatherApiUtxo[]> {
    const network = this.settingsService.getSettings().network.chain.bitcoin.bitcoinNetwork;
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET(`/v1/utxos/addresses/{address}`, {
            params: { path: { address }, query: { network } },
            signal,
          }),
        {
          priority: leatherApiPriorities.utxos,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-utxos-address', network, address],
          fetchFn
        );
  }

  async fetchBitcoinTransactions(
    descriptor: string,
    pageRequest: LeatherApiPageRequest,
    { signal, skipCache }: ApiRequestOptions = {}
  ) {
    const params = getPageRequestQueryParams(pageRequest);
    const network = selectBitcoinNetwork(this.settingsService.getSettings());
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET(`/v1/transactions/bitcoin/descriptors/{descriptor}`, {
            params: {
              path: { descriptor },
              query: {
                network,
                page: pageRequest.page.toString(),
                pageSize: pageRequest.pageSize.toString(),
              },
            },
            signal,
          }),
        {
          priority: leatherApiPriorities.bitcoinTransactions,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-bitcoin-descriptor-transactions', descriptor, params.toString()],
          fetchFn
        );
  }

  async fetchBitcoinTransactionsByAddress(
    address: string,
    pageRequest: LeatherApiPageRequest,
    { signal, skipCache }: ApiRequestOptions = {}
  ) {
    const params = getPageRequestQueryParams(pageRequest);
    const network = selectBitcoinNetwork(this.settingsService.getSettings());
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET(`/v1/transactions/bitcoin/addresses/{address}`, {
            params: {
              path: { address },
              query: {
                network,
                page: pageRequest.page.toString(),
                pageSize: pageRequest.pageSize.toString(),
              },
            },
            signal,
          }),
        {
          priority: leatherApiPriorities.bitcoinTransactions,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-bitcoin-address-transactions', address, params.toString()],
          fetchFn
        );
  }

  async fetchBitcoinTransactionByTxId(txid: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const network = selectBitcoinNetwork(this.settingsService.getSettings());
    const fetchFn = async () => {
      try {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/transactions/bitcoin/{txid}', {
              signal,
              params: { path: { txid }, query: { network } },
            }),
          {
            priority: leatherApiPriorities.bitcoinTransactions,
            signal,
          }
        );
        return data!;
      } catch (error) {
        if (
          LeatherApiError.isLeatherApiError(error) &&
          (error.isNotFound() || error.isUnprocessableEntity())
        ) {
          return null;
        }
        throw error;
      }
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-bitcoin-transaction-by-txid', network, txid],
          fetchFn
        );
  }

  async fetchUsdExchangeRates({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/market/fiat-rates', { signal }),
        {
          priority: leatherApiPriorities.fiatExchangeRates,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-usd-exchange-rates'], fetchFn);
  }

  async fetchBitcoinFeeRates({
    signal,
    skipCache,
  }: ApiRequestOptions = {}): Promise<LeatherApiBitcoinFeeRates> {
    const network = selectBitcoinNetwork(this.settingsService.getSettings());
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/market/bitcoin/fees', { signal, params: { query: { network } } }),
        {
          priority: leatherApiPriorities.bitcoinFeeRates,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-bitcoin-fee-rates', network], fetchFn);
  }

  async fetchNativeTokenPriceList({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/market/prices/native', { signal }),
        {
          priority: leatherApiPriorities.nativeTokenPriceList,
          signal,
        }
      );
      if (data?.format !== 'list') {
        throw new Error('Unrecognized collection format');
      }
      return data?.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-native-token-price-list'], fetchFn);
  }

  async fetchNativeTokenPriceMap({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/market/prices/native', {
            signal,
            params: {
              query: { format: 'map' },
            },
          }),
        {
          priority: leatherApiPriorities.nativeTokenPriceMap,
          signal,
        }
      );
      if (data?.format !== 'map') {
        throw new Error('Unrecognized collection format');
      }
      return data?.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-native-token-price-map'], fetchFn);
  }

  async fetchNativeTokenPrice(symbol: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/market/prices/native/{symbol}', {
            signal,
            params: { path: { symbol } },
          }),
        {
          priority: leatherApiPriorities.nativeTokenPrice,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-native-token-price', symbol], fetchFn);
  }

  async fetchNativeTokenDescription(
    symbol: string,
    locale: LeatherApiLocale,
    { signal, skipCache }: ApiRequestOptions = {}
  ) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/tokens/native/{symbol}/description', {
            signal,
            params: { path: { symbol }, query: { locale } },
          }),
        {
          priority: leatherApiPriorities.nativeTokenDescription,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-native-token-description', symbol, locale],
          fetchFn
        );
  }

  async fetchNativeTokenHistory(
    symbol: string,
    period: HistoricalPeriod,
    { signal, skipCache }: ApiRequestOptions = {}
  ) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/market/prices/native/{symbol}/history', {
            signal,
            params: { path: { symbol }, query: { period } },
          }),
        {
          priority: leatherApiPriorities.nativeTokenHistory,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-native-token-history', symbol, period],
          fetchFn
        );
  }

  async fetchSip10PriceList({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/market/prices/sip10s', { signal }),
        {
          priority: leatherApiPriorities.sip10PriceList,
          signal,
        }
      );
      if (data?.format !== 'list') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-sip10-price-list'], fetchFn);
  }

  async fetchSip10PriceMap({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/market/prices/sip10s', {
            signal,
            params: { query: { format: 'map' } },
          }),
        {
          priority: leatherApiPriorities.sip10PriceMap,
          signal,
        }
      );
      if (data?.format !== 'map') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-sip10-price-map'], fetchFn);
  }

  async fetchSip10Price(principal: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/market/prices/sip10s/{principal}', {
            signal,
            params: { path: { principal } },
          }),
        {
          priority: leatherApiPriorities.sip10Price,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-sip10-price', principal], fetchFn);
  }

  async fetchSip10TokenList({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/tokens/sip10s', { signal }),
        {
          priority: leatherApiPriorities.sip10TokenList,
          signal,
        }
      );
      if (data?.format !== 'list') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-sip10-token-list'], fetchFn);
  }

  async fetchSip10TokenMap({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/tokens/sip10s', {
            signal,
            params: { query: { format: 'map' } },
          }),
        {
          priority: leatherApiPriorities.sip10TokenMap,
          signal,
        }
      );
      if (data?.format !== 'map') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-sip10-token-map'], fetchFn);
  }

  async fetchSip10Token(principal: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      try {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/tokens/sip10s/{principal}', {
              signal,
              params: { path: { principal } },
            }),
          {
            priority: leatherApiPriorities.sip10Token,
            signal,
          }
        );
        return data!;
      } catch (error) {
        if (
          LeatherApiError.isLeatherApiError(error) &&
          (error.isNotFound() || error.isUnprocessableEntity())
        ) {
          return null;
        }
        throw error;
      }
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-sip10-token', principal], fetchFn);
  }

  async fetchSip10TokenDescription(
    principal: string,
    locale: LeatherApiLocale,
    { signal, skipCache }: ApiRequestOptions = {}
  ) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/tokens/sip10s/{principal}/description', {
            signal,
            params: { path: { principal }, query: { locale } },
          }),
        {
          priority: leatherApiPriorities.sip10TokenDescription,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-sip10-token-description', principal, locale],
          fetchFn
        );
  }

  async fetchSip10TokenHistory(
    principal: string,
    period: HistoricalPeriod,
    { signal, skipCache }: ApiRequestOptions = {}
  ) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
        this.client.GET('/v1/market/prices/sip10s/{principal}/history', {
          signal,
          params: { path: { principal }, query: { period } },
        })
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-sip10-token-history', principal, period],
          fetchFn
        );
  }

  async registerAddresses(
    {
      addresses,
      notificationToken,
      chain,
    }: {
      addresses: string[];
      notificationToken: string;
      chain: SupportedBlockchains;
    },
    { signal, skipCache }: ApiRequestOptions = {}
  ) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.POST('/v1/notifications/register', {
            body: {
              addresses,
              notificationToken,
              chain,
              network: 'mainnet',
            },
            signal,
          }),
        {
          priority: leatherApiPriorities.registerAddresses,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-register-notifications', addresses, notificationToken, chain],
          fetchFn
        );
  }

  async fetchSwapDexes({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
        this.client.GET('/v1/swap/dexes', { signal })
      );
      return data!;
    };

    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-swap-dexes'], fetchFn);
  }

  async fetchAppConfig({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
        this.client.GET('/v1/app-config', { signal })
      );
      return data!;
    };

    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-app-config'], fetchFn);
  }

  async fetchBitflowPoolMap({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/defi/bitflow/pools', {
            signal,
            params: { query: { format: 'map' } },
          }),
        {
          priority: leatherApiPriorities.bitflowPoolsMap,
          signal,
        }
      );
      if (data?.format !== 'map') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-bitflow-pools-map'], fetchFn);
  }

  async fetchZestReserve(
    principal: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<LeatherApiZestReserve> {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/defi/zest/reserves/{principal}', {
            signal,
            params: { path: { principal } },
          }),
        {
          priority: leatherApiPriorities.zestReserve,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-zest-reserve', principal], fetchFn);
  }

  async fetchGraniteMarket(principal: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/defi/granite/markets/{principal}', {
            signal,
            params: { path: { principal } },
          }),
        {
          priority: leatherApiPriorities.graniteMarket,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-granite-market', principal], fetchFn);
  }

  async fetchStackingDaoRates({
    signal,
    skipCache,
  }: ApiRequestOptions = {}): Promise<LeatherApiStackingDaoRates> {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/defi/stacking-dao/rates', { signal }),
        {
          priority: leatherApiPriorities.stackingDaoRates,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-stacking-dao-rates'], fetchFn);
  }

  async fetchNativeAnalyticsMap({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/analytics/native', {
            signal,
            params: { query: { format: 'map' } },
          }),
        {
          priority: leatherApiPriorities.nativeAnalyticsMap,
          signal,
        }
      );
      if (data?.format !== 'map') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-native-analytics-map'], fetchFn);
  }

  async fetchNativeAnalytics(symbol: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      try {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/analytics/native/{symbol}', {
              signal,
              params: { path: { symbol } },
            }),
          {
            priority: leatherApiPriorities.nativeAnalytics,
            signal,
          }
        );
        return data!;
      } catch (error) {
        if (
          LeatherApiError.isLeatherApiError(error) &&
          (error.isNotFound() || error.isUnprocessableEntity())
        ) {
          return null;
        }
        throw error;
      }
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-native-analytics', symbol], fetchFn);
  }

  async fetchNativeDistribution(symbol: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      try {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/analytics/native/{symbol}/distribution', {
              signal,
              params: { path: { symbol } },
            }),
          {
            priority: leatherApiPriorities.nativeDistribution,
            signal,
          }
        );
        return data!;
      } catch (error) {
        if (
          LeatherApiError.isLeatherApiError(error) &&
          (error.isNotFound() || error.isUnprocessableEntity())
        ) {
          return null;
        }
        throw error;
      }
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-native-distribution', symbol],
          fetchFn
        );
  }

  async fetchSip10AnalyticsMap({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/analytics/sip10s', {
            signal,
            params: { query: { format: 'map' } },
          }),
        {
          priority: leatherApiPriorities.sip10AnalyticsMap,
          signal,
        }
      );
      if (data?.format !== 'map') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-sip10-analytics-map'], fetchFn);
  }

  async fetchSip10Analytics(principal: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      try {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/analytics/sip10s/{principal}', {
              signal,
              params: { path: { principal } },
            }),
          {
            priority: leatherApiPriorities.sip10Analytics,
            signal,
          }
        );
        return data!;
      } catch (error) {
        if (
          LeatherApiError.isLeatherApiError(error) &&
          (error.isNotFound() || error.isUnprocessableEntity())
        ) {
          return null;
        }
        throw error;
      }
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-sip10-analytics', principal], fetchFn);
  }

  async fetchSip10Distribution(principal: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      try {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/analytics/sip10s/{principal}/distribution', {
              signal,
              params: { path: { principal } },
            }),
          {
            priority: leatherApiPriorities.sip10Distribution,
            signal,
          }
        );
        return data!;
      } catch (error) {
        if (
          LeatherApiError.isLeatherApiError(error) &&
          (error.isNotFound() || error.isUnprocessableEntity())
        ) {
          return null;
        }
        throw error;
      }
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['leather-api-sip10-distribution', principal],
          fetchFn
        );
  }

  async fetchProtocols({ signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/protocols', { signal }),
        {
          priority: leatherApiPriorities.protocols,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-protocols'], fetchFn);
  }

  async fetchProtocolContracts(id: string, { signal, skipCache }: ApiRequestOptions = {}) {
    const fetchFn = async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/protocols/{id}/contracts', {
            signal,
            params: { path: { id } },
          }),
        {
          priority: leatherApiPriorities.protocolContracts,
          signal,
        }
      );
      return data!;
    };
    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['leather-api-protocol-contracts', id], fetchFn);
  }

  async proposeMultisigTransaction(
    body: {
      multisigAddress: string;
      rawPayload: string;
      proposalSignature: string;
      proposalTimestamp: number;
    },
    { baseUrl, signal }: ProposeMultisigTransactionOptions = {}
  ) {
    const client = baseUrl ? createLeatherOpenApiClient(baseUrl, this.clientId) : this.client;
    const { data } = await this.rateLimiter.add(
      RateLimiterType.Leather,
      () => client.POST('/v1/multisig-ext/propose', { body, signal }),
      {
        priority: leatherApiPriorities.proposeMultisigTransaction,
        signal,
      }
    );
    return data!;
  }
}
