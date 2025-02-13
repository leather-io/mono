import axios from 'axios';
import { z } from 'zod';

import { SupportedBlockchains } from '@leather.io/models';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { SettingsService } from '../../settings/settings.service';

const leatherApiUtxoSchema = z.object({
  address: z.string(),
  confirmations: z.number().optional(),
  height: z.number().optional(),
  path: z.string(),
  txid: z.string(),
  value: z.string(),
  vout: z.number(),
});

const leatherApiTxVinLightSchema = z.object({
  value: z.string(),
  n: z.number(),
  addresses: z.array(z.string()),
  isAddress: z.boolean(),
  isOwn: z.boolean(),
});

const leatherApiTxVoutLightSchema = z.object({
  value: z.string(),
  n: z.number(),
  spent: z.boolean(),
  addresses: z.array(z.string()),
  isAddress: z.boolean(),
  isOwn: z.boolean(),
});
const leatherApiTxLightSchema = z.object({
  txid: z.string(),
  blockHash: z.string().optional(),
  blockHeight: z.number(),
  confirmations: z.number(),
  blockTime: z.number(),
  value: z.string(),
  valueIn: z.string(),
  fees: z.string(),
  vin: leatherApiTxVinLightSchema,
  vout: leatherApiTxVoutLightSchema,
});

const leatherApiFiatExchangeRatesSchema = z.object({
  USD: z.number(),
  EUR: z.number(),
  GBP: z.number(),
  AUD: z.number(),
  CAD: z.number(),
  CNY: z.number(),
  JPY: z.number(),
  KRW: z.number(),
});

const mockFiatExchangeRatesResponse = {
  USD: 1,
  EUR: 0.965411,
  GBP: 0.808343,
  AUD: 1.595469,
  CAD: 1.435245,
  CNY: 7.288765,
  JPY: 152.33683,
  KRW: 1450.4297,
};

export type LeatherApiUtxo = z.infer<typeof leatherApiUtxoSchema>;
export type LeatherApiTxLight = z.infer<typeof leatherApiTxLightSchema>;
export interface LeatherApiExchangeRates {
  [symbol: string]: number;
}

export interface LeatherApiClient {
  fetchFiatExchangeRates(signal?: AbortSignal): Promise<LeatherApiExchangeRates>;
  fetchUtxos(descriptor: string, signal?: AbortSignal): Promise<LeatherApiUtxo[]>;
  fetchTxs(descriptor: string, signal?: AbortSignal): Promise<LeatherApiTxLight[]>;
  registerAddresses(
    variables: {
      addresses: string[];
      notificationToken: string;
      chain: SupportedBlockchains;
    },
    signal?: AbortSignal
  ): Promise<unknown>;
}

export function createLeatherApiClient(
  cacheService: HttpCacheService,
  settingsService: SettingsService
): LeatherApiClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function fetchFiatExchangeRates(signal?: AbortSignal) {
    return await cacheService.fetchWithCache(
      ['leather-fiat-exchange-rates'],
      async () => {
        // TODO: replace with Leather API call once available
        const res = await Promise.resolve(mockFiatExchangeRatesResponse);
        return leatherApiFiatExchangeRatesSchema.parse(res);
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async function fetchUtxos(descriptor: string, signal?: AbortSignal) {
    const network = settingsService.getSettings().network.chain.bitcoin.bitcoinNetwork;
    return await cacheService.fetchWithCache(
      ['leather-utxos', network, descriptor],
      async () => {
        const res = await axios.get<LeatherApiUtxo[]>(
          `https://leather-bitcoin-balances.wallet-6d1.workers.dev/${network}/${descriptor}`,
          { signal }
        );
        return z.array(leatherApiUtxoSchema).parse(res.data);
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }

  async function fetchTxs(descriptor: string, signal?: AbortSignal) {
    const network = settingsService.getSettings().network.chain.bitcoin.bitcoinNetwork;
    return await cacheService.fetchWithCache(
      ['leather-txs', network, descriptor],
      async () => {
        const res = await axios.get<LeatherApiUtxo[]>(
          `https://leather-bitcoin-balances.wallet-6d1.workers.dev/${network}/${descriptor}/txs`,
          { signal }
        );
        return z.array(leatherApiTxLightSchema).parse(res.data);
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
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
  ) {
    return await cacheService.fetchWithCache(
      ['/notifications/register', addresses, notificationToken, chain],
      async () => {
        // TODO: just await for now
        try {
          await axios.post<LeatherApiUtxo[]>(
            `https://leather-api-gateway-staging.wallet-6d1.workers.dev/v1/notifications/register`,
            { addresses, notificationToken, chain, network: 'mainnet', signal }
          );
        } catch {
          // TODO: add analytics here
        }
        return null;
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }

  return {
    fetchFiatExchangeRates,
    fetchUtxos,
    fetchTxs,
    registerAddresses,
  };
}
