import axios from 'axios';
import { z } from 'zod';

import { QueryClientService } from '../../cache/query-client.service';
import { NetworkSettingsService } from '../../settings/network-settings.service';
import { getBlockbookBalanceUrl, getBlockbookUtxoUrl } from './blockbook.utils';

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
});

export type BlockbookUtxo = z.infer<typeof blockbookUtxoSchema>;
export type BlockbookBalance = z.infer<typeof blockbookBalanceSchema>;
const blockbookAccountUtxoResponseSchema = z.array(blockbookUtxoSchema);

export interface BlockbookApiClient {
  fetchAccountUtxos(descriptor: string): Promise<BlockbookUtxo[]>;
  fetchAccountBalance(descriptor: string): Promise<BlockbookBalance>;
}

export function createBlockbookApiClient(
  networkSettings: NetworkSettingsService,
  _queryClient: QueryClientService
) {
  async function fetchAccountUtxos(descriptor: string) {
    const resp = await axios.get<BlockbookUtxo[]>(
      getBlockbookUtxoUrl(descriptor, networkSettings.getConfig().id)
    );
    return blockbookAccountUtxoResponseSchema.parse(resp.data);
  }

  async function fetchAccountBalance(descriptor: string) {
    try {
      const resp = await axios.get(
        getBlockbookBalanceUrl(descriptor, networkSettings.getConfig().id)
      );
      return blockbookBalanceSchema.parse(resp.data);
    } catch (e) {
      // log?
      throw e;
    }
  }

  return {
    fetchAccountUtxos,
    fetchAccountBalance,
  };
}
