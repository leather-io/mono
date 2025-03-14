import { injectable } from 'inversify';

import { AccountAddresses } from '@leather.io/models';
import { hasBitcoinAddress } from '@leather.io/utils';

import {
  LeatherApiBitcoinTransaction,
  LeatherApiClient,
} from '../infrastructure/api/leather/leather-api.client';

@injectable()
export class BitcoinTransactionsService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  /* 
    Gets bitcoin transactions for an account
  */
  public async getAccountTransactions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<LeatherApiBitcoinTransaction[]> {
    if (!hasBitcoinAddress(account)) return [];

    const [nativeSegwitTxs, taprootTxs] = await Promise.all([
      this.getDescriptorTransactions(account.bitcoin.nativeSegwitDescriptor, signal),
      this.getDescriptorTransactions(account.bitcoin.taprootDescriptor, signal),
    ]);

    const uniqueTxsMap = new Map<string, LeatherApiBitcoinTransaction>();
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
  ): Promise<LeatherApiBitcoinTransaction[]> {
    const res = await this.leatherApiClient.fetchBitcoinTransactions(
      descriptor,
      { page: 1, pageSize: 50 },
      signal
    );
    return res.data;
  }
}
