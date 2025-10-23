import { injectable } from 'inversify';

import { AccountAddresses, BitcoinTransaction } from '@leather.io/models';
import { hasBitcoinAddress } from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { createBitcoinTransaction } from './bitcoin-transactions.utils';

@injectable()
export class BitcoinTransactionsService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  public async getTransactionByTxId(
    txid: string,
    signal?: AbortSignal
  ): Promise<BitcoinTransaction | null> {
    const tx = await this.leatherApiClient.fetchBitcoinTransactionByTxId(txid, { signal });
    return tx ? createBitcoinTransaction(tx) : null;
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
    const res = await this.leatherApiClient.fetchBitcoinTransactions(
      descriptor,
      { page: 1, pageSize: 50 },
      { signal }
    );
    return res.data.map(createBitcoinTransaction);
  }
}
