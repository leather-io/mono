import { StacksQueryPrefixes } from '../../query-prefixes';
import { type StacksTxFeeEstimation } from '../hiro-api-types';
import { type StacksClient } from '../stacks-client';
import { defaultApiFeeEstimations } from './fees.utils';

interface CreatePostStacksFeeTransactionQueryOptionsArgs {
  client: StacksClient;
  estimatedLen: number | null;
  transactionPayload: string;
}
export function createPostStacksFeeTransactionQueryOptions({
  client,
  estimatedLen,
  transactionPayload,
}: CreatePostStacksFeeTransactionQueryOptionsArgs) {
  return {
    enabled: transactionPayload !== '',
    queryKey: [StacksQueryPrefixes.PostFeeTransaction, transactionPayload],
    async queryFn() {
      try {
        return await client.postFeeTransaction(estimatedLen, transactionPayload);
      } catch (err) {
        const fallbackFeeEstimation: StacksTxFeeEstimation = {
          cost_scalar_change_by_byte: 0,
          estimated_cost: {},
          estimated_cost_scalar: 0,
          estimations: defaultApiFeeEstimations,
          error: err instanceof Error && err.message ? err.message : 'Error',
        };
        return fallbackFeeEstimation;
      }
    },
  } as const;
}
