import axios from 'axios';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { NetworkSettingsService } from '../../settings/network-settings.service';

export interface LeatherApiUtxo {
  address: string;
  confirmations: number;
  height?: number;
  path: string;
  txid: string;
  value: string;
  vout: number;
}

export interface LeatherApiClient {
  fetchUtxos(descriptor: string, signal?: AbortSignal): Promise<LeatherApiUtxo[]>;
}

export function createLeatherApiClient(
  cacheService: HttpCacheService,
  networkService: NetworkSettingsService
) {
  async function fetchUtxos(descriptor: string, signal?: AbortSignal) {
    const network = networkService.getConfig().chain.bitcoin.bitcoinNetwork;
    return await cacheService.fetchWithCache<LeatherApiUtxo[]>(
      ['leather-utxos', network, descriptor],
      async () => {
        const res = await axios.get(
          `https://leather-bitcoin-balances.wallet-6d1.workers.dev/${network}/${descriptor}`,
          { signal }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }

  return {
    fetchUtxos,
  };
}
