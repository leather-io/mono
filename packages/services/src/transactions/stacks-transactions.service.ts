import { injectable } from 'inversify';

import { StacksTransaction } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { type HiroPrincipalMempoolTransaction } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  filterOutConfirmedTransactions,
  filterOutStaleTransactions,
} from './stacks-transactions.utils';

const confirmedTransactionsLimit = 50;

@injectable()
export class StacksTransactionsService {
  constructor(private readonly stacksApiClient: HiroStacksApiClient) {}

  public async getTransactionById(
    txid: string,
    signal?: AbortSignal
  ): Promise<StacksTransaction | null> {
    return await this.stacksApiClient.getTransactionById(txid, { signal });
  }

  /**
   * Gets pending Stacks transactions from mempool by address.
   */
  public async getPendingTransactions(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroPrincipalMempoolTransaction[]> {
    const [mempoolTransactionsResponse, principalTransactionsResponse] = await Promise.all([
      this.stacksApiClient.getPrincipalMempoolTransactions(address, {}, { signal }),
      this.stacksApiClient.getPrincipalTransactions(
        address,
        { limit: confirmedTransactionsLimit },
        { signal }
      ),
    ]);
    const addressTransactions = principalTransactionsResponse.results.map(
      result => result.transaction
    );
    return mempoolTransactionsResponse.results
      .filter(tx => tx.status === 'pending')
      .filter(filterOutConfirmedTransactions(addressTransactions))
      .filter(filterOutStaleTransactions(addressTransactions));
  }
}
