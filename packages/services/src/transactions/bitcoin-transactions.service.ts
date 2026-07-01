import { inject, injectable } from 'inversify';

import { AccountAddresses, BitcoinTransaction } from '@leather.io/models';
import { hasBitcoinAddress } from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import type { LeatherApiPageRequest } from '../infrastructure/api/leather/leather-api.pagination';
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
    pageRequest: LeatherApiPageRequest,
    signal?: AbortSignal
  ): Promise<BitcoinTransaction[]> {
    if (!hasBitcoinAddress(account)) return [];

    if (account.bitcoin.type === 'fixedAddress') {
      return this.getAddressTransactions(account.bitcoin.address, pageRequest, signal);
    }

    const [nativeSegwitTxs, taprootTxs] = await Promise.all([
      this.getDescriptorTransactions(account.bitcoin.nativeSegwitDescriptor, pageRequest, signal),
      this.getDescriptorTransactions(account.bitcoin.taprootDescriptor, pageRequest, signal),
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
    pageRequest: LeatherApiPageRequest,
    signal?: AbortSignal
  ): Promise<BitcoinTransaction[]> {
    const networkMode = selectBitcoinNetworkMode(this.settings.getSettings());
    if (networkMode === 'regtest') {
      const mempoolTxs = await this.mempoolApiClient.fetchDescriptorTransactions(descriptor, {
        signal,
      });
      return mempoolTxs.map(createBitcoinTransactionFromMempool);
    }
    const page = await this.leatherApiClient.fetchBitcoinTransactions(descriptor, pageRequest, {
      signal,
    });
    return page.data.map(createBitcoinTransactionFromLeather);
  }

  public async getAddressTransactions(
    address: string,
    pageRequest: LeatherApiPageRequest,
    signal?: AbortSignal
  ): Promise<BitcoinTransaction[]> {
    const page = await this.leatherApiClient.fetchBitcoinTransactionsByAddress(
      address,
      pageRequest,
      { signal }
    );
    return page.data.map(createBitcoinTransactionFromLeather);
  }
}
