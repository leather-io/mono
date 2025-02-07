import { AccountAddresses } from '@leather.io/models';
import { hasBitcoinAddress } from '@leather.io/utils';

import {
  LeatherApiBitcoinTransaction,
  LeatherApiClient,
} from '../infrastructure/api/leather/leather-api.client';

export interface BitcoinTransactionsService {
  getAccountTransactions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<LeatherApiBitcoinTransaction[]>;
  getDescriptorTransactions(
    descriptor: string,
    signal?: AbortSignal
  ): Promise<LeatherApiBitcoinTransaction[]>;
}

export function createBitcoinTransactionsService(
  leatherApiClient: LeatherApiClient
): BitcoinTransactionsService {
  /* 
    Gets bitcoin transactions for an account
  */
  async function getAccountTransactions(account: AccountAddresses, signal?: AbortSignal) {
    if (!hasBitcoinAddress(account)) return [];

    const [nativeSegwitTxs, taprootTxs] = await Promise.all([
      getDescriptorTransactions(account.bitcoin.nativeSegwitDescriptor, signal),
      getDescriptorTransactions(account.bitcoin.taprootDescriptor, signal),
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
  async function getDescriptorTransactions(descriptor: string, signal?: AbortSignal) {
    const res = await leatherApiClient.fetchBitcoinTransactions(
      descriptor,
      { page: 1, pageSize: 50 },
      signal
    );
    return res.data;
  }

  return {
    getAccountTransactions,
    getDescriptorTransactions,
  };
}
