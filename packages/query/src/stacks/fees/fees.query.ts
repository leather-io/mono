import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksTxFeeEstimation } from '../hiro-api-types';
import { StacksClient } from '../stacks-client';
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
    queryFn: async () => {
      try {
        return await client.postFeeTransaction(estimatedLen, transactionPayload);
      } catch (err) {
        return {
          cost_scalar_change_by_byte: 0,
          estimated_cost: {},
          estimated_cost_scalar: 0,
          estimations: defaultApiFeeEstimations,
          error: err ?? 'Error',
        } as StacksTxFeeEstimation;
      }
    },
  } as const;
}
