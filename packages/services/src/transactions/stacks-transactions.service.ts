import { injectable } from 'inversify';

import { StacksTx } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  filterOutConfirmedTransactions,
  filterOutStaleTransactions,
} from './stacks-transactions.utils';

@injectable()
export class StacksTransactionsService {
  constructor(private readonly stacksApiClient: HiroStacksApiClient) {}
  /**
   * Gets pending Stacks transactions from mempool by address.
   */
  public async getPendingTransactions(address: string, signal?: AbortSignal): Promise<StacksTx[]> {
    const [mempoolTransactionsResponse, addressTransactionsResponse] = await Promise.all([
      this.stacksApiClient.getAddressMempoolTransactions(address, signal),
      this.stacksApiClient.getAddressTransactions(address, { pages: 1 }, signal),
    ]);
    const addressTransactions = addressTransactionsResponse.map(tx => tx.tx);
    return mempoolTransactionsResponse.results
      .filter(filterOutConfirmedTransactions(addressTransactions))
      .filter(filterOutStaleTransactions(addressTransactions));
  }
}
