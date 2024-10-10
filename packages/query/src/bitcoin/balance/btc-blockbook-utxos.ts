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
  return {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: createUtxoAccountCacheKey(network, descriptor),
    queryFn: () => fetchAccountDescriptorUtxos(network, descriptor),
  } satisfies UseQueryOptions;
}

// const balanceSchema = z.object({
//   page: z.number(),
//   totalPages: z.number(),
//   itemsOnPage: z.number(),
//   address: z.string(),
//   balance: z.string(),
//   totalReceived: z.string(),
//   totalSent: z.string(),
//   unconfirmedBalance: z.string(),
//   unconfirmedTxs: z.number(),
//   txs: z.number(),
//   txids: z.array(z.string()),
//   usedTokens: z.number(),
//   tokens: z.array(
//     z.object({
//       type: z.string(),
//       name: z.string(),
//       path: z.string(),
//       transfers: z.number(),
//       decimals: z.number(),
//       balance: z.string(),
//       totalReceived: z.string(),
//       totalSent: z.string(),
//     })
//   ),
// });

// export type BlockbookBalance = z.infer<typeof balanceSchema>;

// function crateBlockbookBalanceUrl(descriptor: string, network: BitcoinNetworkModes) {
//   return [getQuicknodeUrlByNetwork(network), 'xpub', descriptor].join('/');
// }

// export async function fetchBlockbookAccountDescriptorBalance(
//   descriptor: string,
//   network: BitcoinNetworkModes
// ) {
//   const resp = await axios.get(crateBlockbookBalanceUrl(descriptor, network));
//   return balanceSchema.parse(resp.data);
// }

// export function createBlockbookBalanceQueryOptions(
//   descriptor: string,
//   network: BitcoinNetworkModes
// ) {
//   return {
//     refetchOnReconnect: false,
//     refetchOnWindowFocus: false,
//     queryKey: ['btc-blockbook-balance', descriptor],
//     queryFn: () => fetchBlockbookAccountDescriptorBalance(descriptor, network),
//   } satisfies UseQueryOptions;
// }
