import { UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

const baseBlockbookUrl =
  'https://delicate-bitter-tent.btc.quiknode.pro/f2ee754a95c4202b8dba208a68f7d1f75b2acc5f/api/v2';

const blockbookUtxoSchema = z.object({
  address: z.string(),
  confirmations: z.number(),
  // Unconfirmed utxos appear in this response. Height omitted when unconfirmed.
  height: z.number().optional(),
  path: z.string(),
  txid: z.string(),
  value: z.string(),
  vout: z.number(),
});

const blockbookAccountUtxoResponseSchema = z.array(blockbookUtxoSchema);

type BlockbookUtxo = z.infer<typeof blockbookUtxoSchema>;

// E.g.
// wpkh(xpub6CxzM41aUbKigFCifZxs9wkX37SMm5qRFqYjk1VdUZtwK3a5YoNnqZuNe29xycKLLThEEXDaKLLhke2Kwi2xKhrj14mwCCyzBGChGcaJH9L)
function crateBlockbookUtxosUrl(descriptor: string) {
  return [baseBlockbookUrl, 'utxo', descriptor].join('/');
}

export async function fetchBlockbookAccountDescriptorUtxos(descriptor: string) {
  const resp = await axios.get<BlockbookUtxo[]>(crateBlockbookUtxosUrl(descriptor));
  return blockbookAccountUtxoResponseSchema.parse(resp.data);
}

export function createBlockbookQueryOptions(descriptor: string) {
  return {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: ['btc-blockbook-utxos', descriptor],
    queryFn: () => fetchBlockbookAccountDescriptorUtxos(descriptor),
  } satisfies UseQueryOptions;
}

const blockbookBalanceSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  itemsOnPage: z.number(),
  address: z.string(),
  balance: z.string(),
  totalReceived: z.string(),
  totalSent: z.string(),
  unconfirmedBalance: z.string(),
  unconfirmedTxs: z.number(),
  txs: z.number(),
  txids: z.array(z.string()),
  usedTokens: z.number(),
  tokens: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      path: z.string(),
      transfers: z.number(),
      decimals: z.number(),
      balance: z.string(),
      totalReceived: z.string(),
      totalSent: z.string(),
    })
  ),
});

function crateBlockbookBalanceUrl(descriptor: string) {
  return [baseBlockbookUrl, 'xpub', descriptor].join('/');
}

export async function fetchBlockbookAccountDescriptorBalance(descriptor: string) {
  const resp = await axios.get(crateBlockbookBalanceUrl(descriptor));
  return blockbookBalanceSchema.parse(resp.data);
}

export function createBlockbookBalanceQueryOptions(descriptor: string) {
  return {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: ['btc-blockbook-balance', descriptor],
    queryFn: () => fetchBlockbookAccountDescriptorBalance(descriptor),
  } satisfies UseQueryOptions;
}
