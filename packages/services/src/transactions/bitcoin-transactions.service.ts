import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { BitcoinAccountIdentifier } from '../shared/bitcoin.types';

export interface BitcoinTransactionsService {
  getAccountTransactions(account: BitcoinAccountIdentifier, signal?: AbortSignal): Promise<any[]>;
  getDescriptorTransactions(descriptor: string, signal?: AbortSignal): Promise<any[]>;
}

export function createBitcoinTransactionsService(
  leatherApiClient: LeatherApiClient
): BitcoinTransactionsService {
  /* 
    Gets bitcoin transactions for an account
  */
  async function getAccountTransactions(account: BitcoinAccountIdentifier, signal?: AbortSignal) {
    const [nativeSegwitTxs, taprootTxs] = await Promise.all([
      getDescriptorTransactions(account.nativeSegwitDescriptor, signal),
      getDescriptorTransactions(account.taprootDescriptor, signal),
    ]);
    // TODO: combine duplicate txids
    return [...nativeSegwitTxs, ...taprootTxs];
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
