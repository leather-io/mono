import { StacksTx } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  filterOutConfirmedTransactions,
  filterOutStaleTransactions,
} from './stacks-transactions.utils';

export interface StacksTransactionsService {
  getPendingTransactions(address: string, signal?: AbortSignal): Promise<StacksTx[]>;
}

export function createStacksTransactionsService(
  stacksApiClient: HiroStacksApiClient
): StacksTransactionsService {
  /**
   * Gets pending Stacks transactions from mempool by address.
   */
  async function getPendingTransactions(address: string, signal?: AbortSignal) {
    const [mempoolTransactionsRes, confirmedTransactionsRes] = await Promise.all([
      stacksApiClient.getAddressMempoolTransactions(address, signal),
      stacksApiClient.getAddressConfirmedTransactions(address, signal),
    ]);
    return mempoolTransactionsRes.results
      .filter(filterOutConfirmedTransactions(confirmedTransactionsRes.results))
      .filter(filterOutStaleTransactions(confirmedTransactionsRes.results));
  }

  return {
    getPendingTransactions,
  };
}
