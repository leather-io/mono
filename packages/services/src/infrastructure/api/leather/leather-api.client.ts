import axios from 'axios';
import { z } from 'zod';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { NetworkSettingsService } from '../../settings/network-settings.service';

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

export type LeatherApiUtxo = z.infer<typeof leatherApiUtxoSchema>;
export type LeatherApiTxLight = z.infer<typeof leatherApiTxLightSchema>;

export interface LeatherApiClient {
  fetchUtxos(descriptor: string, signal?: AbortSignal): Promise<LeatherApiUtxo[]>;
  fetchTxs(descriptor: string, signal?: AbortSignal): Promise<LeatherApiTxLight[]>;
}

export function createLeatherApiClient(
  cacheService: HttpCacheService,
  networkService: NetworkSettingsService
) {
  async function fetchUtxos(descriptor: string, signal?: AbortSignal) {
    const network = networkService.getConfig().chain.bitcoin.bitcoinNetwork;
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
    const network = networkService.getConfig().chain.bitcoin.bitcoinNetwork;
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

  return {
    fetchUtxos,
    fetchTxs,
  };
}
