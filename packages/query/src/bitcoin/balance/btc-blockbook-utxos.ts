import { UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

import { BitcoinNetwork } from '@leather.io/models';

// E.g.
// mainnet/wpkh(xpub6CxzM41aUbKigFCifZxs9wkX37SMm5qRFqYjk1VdUZtwK3a5YoNnqZuNe29xycKLLThEEXDaKLLhke2Kwi2xKhrj14mwCCyzBGChGcaJH9L)
const balanceApi = 'https://leather-bitcoin-balances.kyran-093.workers.dev/{network}/{descriptor}';

function makeBalanceApiUrl(network: BitcoinNetwork, descriptor: string) {
  return balanceApi.replace('{network}', network).replace('{descriptor}', descriptor);
}

const utxoSchema = z.object({
  address: z.string(),
  confirmations: z.number(),
  // Unconfirmed utxos appear in this response. Height omitted when unconfirmed.
  height: z.number().optional(),
  path: z.string(),
  txid: z.string(),
  value: z.string(),
  vout: z.number(),
});

const accountUtxoResponseSchema = z.array(utxoSchema);

export type Utxo = z.infer<typeof utxoSchema>;

export function createUtxoAccountCacheKey(network: string, descriptor: string) {
  return ['btc-utxos', network, descriptor.substring(0, 10)];
}

export async function fetchAccountDescriptorUtxos(network: BitcoinNetwork, descriptor: string) {
  const resp = await axios.get<Utxo[]>(makeBalanceApiUrl(network, descriptor));
  return accountUtxoResponseSchema.parse(resp.data);
}

export function createUtxoQueryOptions(network: BitcoinNetwork, descriptor: string) {
  // maybe there is some issue with the cache key?
  // this runs twice and adds two separate keys, once each for seqwit + tr
  /**
  LOG  createUtxoQueryOptions mainnet wpkh(xpub6CuWSJTu4HJMVB7Se7gLUF6n27GWyJt4vWHmS5fP82T5nAkUYcCEVXMvhnLniazkvCG7pCCh1N8vA8mz9uVim97d1LuBpwxfRvTDPVeJCht) ["btc-utxos", "mainnet", "wpkh(xpub6"]
 LOG  createUtxoQueryOptions mainnet tr(xpub6CkDCXCcRuVxpyemADVdeVXgNNKAeRtvzByNoJUm7aehjDm2Gn3BV2cU4BnK72UpY2JyRVyj9NcXV39PZKcZcEQ3ixgtgsADXt1skMiRY41) ["btc-utxos", "mainnet", "tr(xpub6Ck"]

   */
  console.log(
    'createUtxoQueryOptions',
    network,
    descriptor,
    createUtxoAccountCacheKey(network, descriptor)
  );
  return {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: createUtxoAccountCacheKey(network, descriptor),
    queryFn: () => fetchAccountDescriptorUtxos(network, descriptor),
  } satisfies UseQueryOptions;
}
