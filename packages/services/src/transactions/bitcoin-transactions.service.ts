import { inject, injectable } from 'inversify';

import { AccountAddresses, BitcoinTransaction } from '@leather.io/models';
import { hasBitcoinAddress } from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { MempoolApiClient } from '../infrastructure/api/mempool/mempool-api.client';
import { selectBitcoinNetworkMode } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import {
  createBitcoinTransactionFromLeather,
  createBitcoinTransactionFromMempool,
} from './bitcoin-transactions.utils';

@injectable()
export class BitcoinTransactionsService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly mempoolApiClient: MempoolApiClient,
    @inject(Types.SettingsService) private readonly settings: SettingsService
  ) {}

  public async getTransactionByTxId(
    txid: string,
    signal?: AbortSignal
  ): Promise<BitcoinTransaction | null> {
    const networkMode = selectBitcoinNetworkMode(this.settings.getSettings());
    if (networkMode === 'regtest') {
      const mempoolTx = await this.mempoolApiClient.fetchTransactionByTxId(txid, undefined, {
        signal,
      });
      return mempoolTx ? createBitcoinTransactionFromMempool(mempoolTx) : null;
    }
    const leatherTx = await this.leatherApiClient.fetchBitcoinTransactionByTxId(txid, { signal });
    return leatherTx ? createBitcoinTransactionFromLeather(leatherTx) : null;
  }

  /* 
    Gets bitcoin transactions for an account
  */
  public async getAccountTransactions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BitcoinTransaction[]> {
    if (!hasBitcoinAddress(account)) return [];

    const [nativeSegwitTxs, taprootTxs] = await Promise.all([
      this.getDescriptorTransactions(account.bitcoin.nativeSegwitDescriptor, signal),
      this.getDescriptorTransactions(account.bitcoin.taprootDescriptor, signal),
    ]);

    const uniqueTxsMap = new Map<string, BitcoinTransaction>();
    [...nativeSegwitTxs, ...taprootTxs].forEach(tx => {
      if (!uniqueTxsMap.has(tx.txid)) {
        uniqueTxsMap.set(tx.txid, tx);
      }
    });

    return Array.from(uniqueTxsMap.values());
  }

  /* 
    Gets bitcoin transactions for a descriptor
  */
  public async getDescriptorTransactions(
    descriptor: string,
    signal?: AbortSignal
  ): Promise<BitcoinTransaction[]> {
    const networkMode = selectBitcoinNetworkMode(this.settings.getSettings());
    if (networkMode === 'regtest') {
      const mempoolTxs = await this.mempoolApiClient.fetchDescriptorTransactions(descriptor, {
        signal,
      });
      return mempoolTxs.map(createBitcoinTransactionFromMempool);
    }
    const firstPage = await this.leatherApiClient.fetchBitcoinTransactions(
      descriptor,
      { page: 1, pageSize: 150 },
      { signal }
    );
    const pagesToFetch = Math.min(firstPage.meta.totalPages, 5);
    if (pagesToFetch <= 1) return firstPage.data.map(createBitcoinTransactionFromLeather);

    const remainingPages = await Promise.all(
      Array.from({ length: pagesToFetch - 1 }, (_, i) =>
        this.leatherApiClient.fetchBitcoinTransactions(
          descriptor,
          { page: i + 2, pageSize: 150 },
          { signal }
        )
      )
    );
    return [firstPage, ...remainingPages].flatMap(p =>
      p.data.map(createBitcoinTransactionFromLeather)
    );
  }
}
