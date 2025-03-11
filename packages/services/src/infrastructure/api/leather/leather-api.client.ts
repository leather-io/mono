import axios from 'axios';
import { z } from 'zod';

import { LEATHER_API_URL } from '@leather.io/constants';
import { SupportedBlockchains } from '@leather.io/models';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { selectBitcoinNetworkMode } from '../../settings/settings.selectors';
import { SettingsService } from '../../settings/settings.service';
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

export interface LeatherApiClient {
  fetchUtxos(descriptor: string, signal?: AbortSignal): Promise<LeatherApiUtxo[]>;
  fetchBitcoinTransactions(
    descriptor: string,
    page: LeatherApiPageRequest,
    signal?: AbortSignal
  ): Promise<LeatherApiPage<LeatherApiBitcoinTransaction>>;
  fetchFiatExchangeRates(signal?: AbortSignal): Promise<LeatherApiFiatRates>;
  fetchCryptoPrices(signal?: AbortSignal): Promise<LeatherApiCryptoPrices>;
  fetchSip10Prices(signal?: AbortSignal): Promise<LeatherApiSip10Prices>;
  registerAddresses(
    variables: {
      addresses: string[];
      notificationToken: string;
      chain: SupportedBlockchains;
    },
    signal?: AbortSignal
  ): Promise<LeatherApiRegisterNotificationsResponse>;
}

export function createLeatherApiClient(
  cacheService: HttpCacheService,
  settingsService: SettingsService
): LeatherApiClient {
  async function fetchUtxos(descriptor: string, signal?: AbortSignal): Promise<LeatherApiUtxo[]> {
    const network = settingsService.getSettings().network.chain.bitcoin.bitcoinNetwork;
    return await cacheService.fetchWithCache(
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

  async function fetchBitcoinTransactions(
    descriptor: string,
    pageRequest: LeatherApiPageRequest,
    signal?: AbortSignal
  ): Promise<LeatherApiPage<LeatherApiBitcoinTransaction>> {
    const params = getPageRequestQueryParams(pageRequest);
    params.append('network', selectBitcoinNetworkMode(settingsService.getSettings()));
    return await cacheService.fetchWithCache(
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

  async function fetchFiatExchangeRates(signal?: AbortSignal): Promise<LeatherApiFiatRates> {
    return await cacheService.fetchWithCache(
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

  async function fetchCryptoPrices(signal?: AbortSignal): Promise<LeatherApiCryptoPrices> {
    return await cacheService.fetchWithCache(
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

  async function fetchSip10Prices(signal?: AbortSignal): Promise<LeatherApiSip10Prices> {
    return await cacheService.fetchWithCache(
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

  async function registerAddresses(
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
    return await cacheService.fetchWithCache(
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

  return {
    fetchUtxos,
    fetchBitcoinTransactions,
    fetchFiatExchangeRates,
    fetchCryptoPrices,
    fetchSip10Prices,
    registerAddresses,
  };
}
