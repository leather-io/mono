import { StacksTxFeeEstimation } from '@leather-wallet/models';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PQueue from 'p-queue';

import { useHiroApiRateLimiter } from '../../hiro-rate-limiter';
import { useCurrentNetworkState } from '../../leather-query-provider';
import { AppUseQueryConfig } from '../../query-config';
import { defaultApiFeeEstimations } from './fees.utils';

function fetchTransactionFeeEstimation(currentNetwork: any, limiter: PQueue) {
  return async (estimatedLen: number | null, transactionPayload: string) => {
    const resp = await limiter.add(
      () =>
        axios.post<StacksTxFeeEstimation>(
          currentNetwork.chain.stacks.url + '/v2/fees/transaction',
          {
            estimated_len: estimatedLen,
            transaction_payload: transactionPayload,
          }
        ),
      {
        priority: 2,
        throwOnTimeout: true,
      }
    );
    return resp.data;
  };
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
  const currentNetwork = useCurrentNetworkState();
  const limiter = useHiroApiRateLimiter();

  return useQuery({
    enabled: transactionPayload !== '',
    queryKey: ['stacks-tx-fee-estimation', transactionPayload],
    queryFn: async () => {
      try {
        return await fetchTransactionFeeEstimation(currentNetwork, limiter)(
          estimatedLen,
          transactionPayload
        );
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
