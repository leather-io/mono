import { inject, injectable } from 'inversify';
import createClient from 'openapi-fetch';
import { v4 as uuidv4 } from 'uuid';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import { SupportedBlockchains } from '@leather.io/models';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import type { Environment } from '../../environment';
import { leatherApiPriorities } from '../../rate-limiter/leather-rate-limiter';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { selectBitcoinNetwork } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
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

@injectable()
export class LeatherApiClient {
  private readonly client;

  constructor(
    @inject(Types.CacheService) private readonly cacheService: HttpCacheService,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.Environment) env: Environment,
    private readonly rateLimiter: RateLimiterService
  ) {
    const clientId = uuidv4();
    this.client = createClient<paths>({
      baseUrl:
        env.environment === 'production'
          ? LEATHER_API_URL_PRODUCTION
          : (env.leatherApiUrl ?? LEATHER_API_URL_STAGING),
    });
    this.client.use({
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
  }

  async fetchUtxos(descriptor: string, signal?: AbortSignal) {
    const network = this.settingsService.getSettings().network.chain.bitcoin.bitcoinNetwork;
    return await this.cacheService.fetchWithCache(
      ['leather-api-utxos', network, descriptor],
      async () => {
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
      }
    );
  }

  async fetchBitcoinTransactions(
    descriptor: string,
    pageRequest: LeatherApiPageRequest,
    signal?: AbortSignal
  ) {
    const params = getPageRequestQueryParams(pageRequest);
    const network = selectBitcoinNetwork(this.settingsService.getSettings());
    return await this.cacheService.fetchWithCache(
      ['leather-api-transactions', descriptor, params.toString()],
      async () => {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET(`/v1/transactions/{descriptor}`, {
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
      }
    );
  }

  async fetchUsdExchangeRates(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-usd-exchange-rates'], async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/market/fiat-rates', { signal }),
        {
          priority: leatherApiPriorities.fiatExchangeRates,
          signal,
        }
      );
      return data!;
    });
  }

  async fetchNativeTokenPriceList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-price-list'],
      async () => {
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
      }
    );
  }

  async fetchNativeTokenPriceMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-price-map'],
      async () => {
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
      }
    );
  }

  async fetchNativeTokenPrice(symbol: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-price', symbol],
      async () => {
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
      }
    );
  }

  async fetchNativeTokenDescription(
    symbol: string,
    locale: LeatherApiLocale,
    signal?: AbortSignal
  ) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-description', symbol, locale],
      async () => {
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
      }
    );
  }

  async fetchNativeTokenHistory(symbol: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-history', symbol],
      async () => {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/market/prices/native/{symbol}/history', {
              signal,
              params: { path: { symbol } },
            }),
          {
            priority: leatherApiPriorities.nativeTokenHistory,
            signal,
          }
        );
        return data!;
      }
    );
  }

  async fetchRunePriceList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-rune-price-list'], async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/market/prices/runes', { signal }),
        {
          priority: leatherApiPriorities.runePriceList,
          signal,
        }
      );
      if (data?.format !== 'list') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    });
  }

  async fetchRunePriceMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-rune-price-map'], async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/market/prices/runes', {
            signal,
            params: { query: { format: 'map' } },
          }),
        {
          priority: leatherApiPriorities.runePriceMap,
          signal,
        }
      );
      if (data?.format !== 'map') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    });
  }

  async fetchRunePrice(runeName: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-price', runeName],
      async () => {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/market/prices/runes/{runeName}', {
              signal,
              params: { path: { runeName } },
            }),
          {
            priority: leatherApiPriorities.runePrice,
            signal,
          }
        );
        return data!;
      }
    );
  }

  async fetchRuneList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-rune-list'], async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () => this.client.GET('/v1/tokens/runes', { signal }),
        {
          priority: leatherApiPriorities.runeList,
          signal,
        }
      );
      if (data?.format !== 'list') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    });
  }

  async fetchRuneMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-rune-map'], async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/tokens/runes', {
            signal,
            params: { query: { format: 'map' } },
          }),
        {
          priority: leatherApiPriorities.runeMap,
          signal,
        }
      );
      if (data?.format !== 'map') {
        throw new Error('Unrecognized collection format');
      }
      return data.data;
    });
  }

  async fetchRune(runeName: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-rune', runeName], async () => {
      const { data } = await this.rateLimiter.add(
        RateLimiterType.Leather,
        () =>
          this.client.GET('/v1/tokens/runes/{runeName}', {
            signal,
            params: { path: { runeName } },
          }),
        {
          priority: leatherApiPriorities.rune,
          signal,
        }
      );
      return data!;
    });
  }

  async fetchRuneDescription(runeName: string, locale: LeatherApiLocale, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-description', runeName, locale],
      async () => {
        const { data } = await this.rateLimiter.add(
          RateLimiterType.Leather,
          () =>
            this.client.GET('/v1/tokens/runes/{runeName}/description', {
              signal,
              params: { path: { runeName }, query: { locale } },
            }),
          {
            priority: leatherApiPriorities.runeDescription,
            signal,
          }
        );
        return data!;
      }
    );
  }

  async fetchRuneHistory(runeName: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-history', runeName],
      async () => {
        const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
          this.client.GET('/v1/market/prices/runes/{runeName}/history', {
            signal,
            params: { path: { runeName } },
          })
        );
        return data!;
      }
    );
  }

  async fetchSip10PriceList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-sip10-price-list'], async () => {
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
    });
  }

  async fetchSip10PriceMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-sip10-price-map'], async () => {
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
    });
  }

  async fetchSip10Price(principal: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-price', principal],
      async () => {
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
      }
    );
  }

  async fetchSip10TokenList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-sip10-token-list'], async () => {
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
    });
  }

  async fetchSip10TokenMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(['leather-api-sip10-token-map'], async () => {
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
    });
  }

  async fetchSip10Token(principal: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-token', principal],
      async () => {
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
      }
    );
  }

  async fetchSip10TokenDescription(
    principal: string,
    locale: LeatherApiLocale,
    signal?: AbortSignal
  ) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-token-description', principal, locale],
      async () => {
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
      }
    );
  }

  async fetchSip10TokenHistory(principal: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-token-history', principal],
      async () => {
        const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
          this.client.GET('/v1/market/prices/sip10s/{principal}/history', {
            signal,
            params: { path: { principal } },
          })
        );
        return data!;
      }
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
    signal?: AbortSignal
  ) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-register-notifications', addresses, notificationToken, chain],
      async () => {
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
      }
    );
  }
}
