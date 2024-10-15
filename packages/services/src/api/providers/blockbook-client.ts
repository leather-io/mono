/* eslint-disable no-console */
import { BtcCryptoAssetBalance, Utxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';
import axios from 'axios';
import { injectable } from 'inversify';
import { z } from 'zod';

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

export type BlockbookUtxo = z.infer<typeof blockbookUtxoSchema>;
export type BlockbookBalance = z.infer<typeof blockbookBalanceSchema>;
const blockbookAccountUtxoResponseSchema = z.array(blockbookUtxoSchema);


@injectable()
export class BlockbookClient {

  private _baseUrl = 'https://delicate-bitter-tent.btc.quiknode.pro/f2ee754a95c4202b8dba208a68f7d1f75b2acc5f/api/v2'

  constructor() {}

  getUtxoUrl(descriptor: string) {
    return [this._baseUrl, 'utxo', descriptor].join('/');
  }

  getBalanceUrl(descriptor: string) {
    return [this._baseUrl, 'xpub', descriptor].join('/');
  }

  async fetchAccountUtxos(descriptor: string): Promise<BlockbookUtxo[]> {
    const resp = await axios.get<BlockbookUtxo[]>(this.getUtxoUrl(descriptor));
    return blockbookAccountUtxoResponseSchema.parse(resp.data)
  }

  async fetchAccountBalance(descriptor: string): Promise<BlockbookBalance> {
    const resp = await axios.get(this.getBalanceUrl(descriptor));
    console.log('fetchAccountBalance after')
    return blockbookBalanceSchema.parse(resp.data);
  }

  mapBalance(blockbookBalance: BlockbookBalance): BtcCryptoAssetBalance {
    return {
      availableBalance: createMoney(Number(blockbookBalance.balance), 'USD'),
      protectedBalance: createMoney(0, 'USD'),
      uneconomicalBalance: createMoney(0, 'USD'),
    }
  }

  mapUtxo(blockbookUtxo: BlockbookUtxo): Utxo {
    return {
      ...blockbookUtxo
    }
  }

}
