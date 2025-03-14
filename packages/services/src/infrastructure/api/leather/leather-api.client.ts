import axios from 'axios';
import { inject, injectable } from 'inversify';
import { z } from 'zod';

import { LEATHER_API_URL } from '@leather.io/constants';
import { SupportedBlockchains } from '@leather.io/models';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { selectBitcoinNetworkMode } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import {
  LeatherApiPage,
  LeatherApiPageRequest,
  getPageRequestQueryParams,
} from './leather-api.pagination';
import {
  leatherApiBitcoinTransactionPageSchema,
  leatherApiBitcoinTransactionSchema,
  leatherApiCryptoPricesSchema,
  leatherApiFiatRatesSchema,
  leatherApiRegisterNotificationsResponseSchema,
  leatherApiSip10PricesSchema,
  leatherApiUtxoSchema,
} from './leather-api.schemas';

export type LeatherApiUtxo = z.infer<typeof leatherApiUtxoSchema>;
export type LeatherApiBitcoinTransaction = z.infer<typeof leatherApiBitcoinTransactionSchema>;
export type LeatherApiFiatRates = z.infer<typeof leatherApiFiatRatesSchema>;
export type LeatherApiCryptoPrices = z.infer<typeof leatherApiCryptoPricesSchema>;
export type LeatherApiSip10Prices = z.infer<typeof leatherApiSip10PricesSchema>;
export type LeatherApiRegisterNotificationsResponse = z.infer<
  typeof leatherApiRegisterNotificationsResponseSchema
>;

@injectable()
export class LeatherApiClient {
  constructor(
    @inject(Types.CacheService) private readonly cacheService: HttpCacheService,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
  ) {}

  async fetchUtxos(descriptor: string, signal?: AbortSignal): Promise<LeatherApiUtxo[]> {
    const network = this.settingsService.getSettings().network.chain.bitcoin.bitcoinNetwork;
    return await this.cacheService.fetchWithCache(
      ['leather-api-utxos', network, descriptor],
      async () => {
        const res = await axios.get<LeatherApiUtxo[]>(
          `${LEATHER_API_URL}/v1/utxos/${descriptor}?network=${network}`,
          { signal }
        );
        return z.array(leatherApiUtxoSchema).parse(res.data);
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }

  async fetchBitcoinTransactions(
    descriptor: string,
    pageRequest: LeatherApiPageRequest,
    signal?: AbortSignal
  ): Promise<LeatherApiPage<LeatherApiBitcoinTransaction>> {
    const params = getPageRequestQueryParams(pageRequest);
    params.append('network', selectBitcoinNetworkMode(this.settingsService.getSettings()));
    return await this.cacheService.fetchWithCache(
      ['leather-api-transactions', descriptor, params.toString()],
      async () => {
        const res = await axios.get<LeatherApiPage<LeatherApiBitcoinTransaction>>(
          `${LEATHER_API_URL}/v1/transactions/${descriptor}?${params.toString()}`,
          { signal }
        );
        return leatherApiBitcoinTransactionPageSchema.parse(res.data);
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }

  async fetchFiatExchangeRates(signal?: AbortSignal): Promise<LeatherApiFiatRates> {
    return await this.cacheService.fetchWithCache(
      ['leather-api-fiat-rates'],
      async () => {
        const res = await axios.get<LeatherApiFiatRates>(
          `${LEATHER_API_URL}/v1/market/fiat-rates`,
          {
            signal,
          }
        );
        return leatherApiFiatRatesSchema.parse(res.data);
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async fetchCryptoPrices(signal?: AbortSignal): Promise<LeatherApiCryptoPrices> {
    return await this.cacheService.fetchWithCache(
      ['leather-api-crypto-prices'],
      async () => {
        const res = await axios.get<LeatherApiCryptoPrices>(
          `${LEATHER_API_URL}/v1/market/crypto-prices`,
          {
            signal,
          }
        );
        return leatherApiCryptoPricesSchema.parse(res.data);
      },
      { ttl: HttpCacheTimeMs.tenMinutes }
    );
  }

  async fetchSip10Prices(signal?: AbortSignal): Promise<LeatherApiSip10Prices> {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-prices'],
      async () => {
        const res = await axios.get<LeatherApiSip10Prices>(
          `${LEATHER_API_URL}/v1/market/sip10-prices`,
          {
            signal,
          }
        );
        return leatherApiSip10PricesSchema.parse(res.data);
      },
      { ttl: HttpCacheTimeMs.tenMinutes }
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
  ): Promise<LeatherApiRegisterNotificationsResponse> {
    return await this.cacheService.fetchWithCache(
      ['leather-api-register-notifications', addresses, notificationToken, chain],
      async () => {
        const res = await axios.post<LeatherApiRegisterNotificationsResponse>(
          `${LEATHER_API_URL}/v1/notifications/register`,
          {
            addresses,
            notificationToken,
            chain,
            network: 'mainnet',
          },
          { signal }
        );
        return leatherApiRegisterNotificationsResponseSchema.parse(res.data);
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }
}
