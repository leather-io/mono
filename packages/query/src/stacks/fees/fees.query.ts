import { useQuery } from '@tanstack/react-query';

import { AppUseQueryConfig } from '../../query-config';
import { StacksTxFeeEstimation } from '../hiro-api-types';
import { StacksClient, useStacksClient } from '../stacks-client';
import { defaultApiFeeEstimations } from './fees.utils';

function fetchTransactionFeeEstimation(client: StacksClient) {
  return async (estimatedLen: number | null, transactionPayload: string) =>
    client.postFeeTransaction(estimatedLen, transactionPayload);
}

type FetchTransactionFeeEstimationResp = Awaited<
  ReturnType<ReturnType<typeof fetchTransactionFeeEstimation>>
>;

export function useGetStacksTransactionFeeEstimationQuery<
  T extends unknown = FetchTransactionFeeEstimationResp,
>(
  estimatedLen: number | null,
  transactionPayload: string,
  options?: AppUseQueryConfig<FetchTransactionFeeEstimationResp, T>
) {
  const client = useStacksClient();

  return useQuery({
    enabled: transactionPayload !== '',
    queryKey: ['stacks-tx-fee-estimation', transactionPayload],
    queryFn: async () => {
      try {
        return await fetchTransactionFeeEstimation(client)(estimatedLen, transactionPayload);
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
    ...options,
  });
}
