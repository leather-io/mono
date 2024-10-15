import axios from 'axios';
import { inject, injectable } from 'inversify';
import { TYPES } from 'inversify-types';
import type { NetworkSettingsService } from 'settings/network-settings.service';
import { z } from 'zod';
import { getBlockbookBalanceUrl, getBlockbookUtxoUrl } from './blockbook.utils';
import type { QueryClientService } from 'cache/query-client.service';

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

@injectable()
export class BlockbookApiClientImpl implements BlockbookApiClient {
  constructor(
    @inject(TYPES.NetworkSettingsService)
    private readonly _networkSettingsService: NetworkSettingsService,
    @inject(TYPES.QueryClientService)
    private readonly _queryClientService: QueryClientService
  ) {}

  async fetchAccountUtxos(descriptor: string) {
    const resp = await axios.get<BlockbookUtxo[]>(
      getBlockbookUtxoUrl(descriptor, this._networkSettingsService.getConfig().id)
    );
    return blockbookAccountUtxoResponseSchema.parse(resp.data);
  }

  async fetchAccountBalance(descriptor: string) {
    // eslint-disable-next-line no-console
    console.log(
      'fetchAccountBalance from network: ' +
        this._networkSettingsService.getConfig().chain.bitcoin.bitcoinNetwork
    );
    console.log(
      'query client: ' +
        JSON.stringify((this._queryClientService.getQueryClient() as any).getQueryCache().getAll())
    );
    try {
      const resp = await axios.get(
        getBlockbookBalanceUrl(descriptor, this._networkSettingsService.getConfig().id)
      );
      return blockbookBalanceSchema.parse(resp.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      throw e;
    }
  }
}
