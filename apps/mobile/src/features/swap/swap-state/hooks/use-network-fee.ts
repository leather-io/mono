import { getExecutionTypeStrategy } from '@/features/swap/swap-state/strategies/execution-type/execution-type';
import { transformTransactionFees } from '@/features/swap/swap-state/strategies/execution-type/transform-transaction-fees';
import {
  DerivedAmounts,
  NetworkFee,
  SwapDependencies,
  SwapExecutionDependencies,
  SwapInternalState,
} from '@/features/swap/swap-state/swap-state.types';
import { isQuoteAlignedWithCurrentInput } from '@/features/swap/swap-state/utils/is-quote-aligned-with-current-input';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { isDefined } from 'remeda';

import { SwapQuote } from '@leather.io/models';
import { assertExistence } from '@leather.io/utils';

interface UseNetworkFeeProps {
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  isSendingMax: boolean;
  quote?: SwapQuote;
  baseAmount?: number;
  dependencies: SwapDependencies;
}

export function useNetworkFee({
  state,
  derivedAmounts,
  isSendingMax,
  quote,
  baseAmount,
  dependencies,
}: UseNetworkFeeProps): UseQueryResult<NetworkFee, Error> {
  const { baseSwapAsset } = state;
  const { accountRequest, services } = dependencies;
  const { swapService } = services;

  return useQuery({
    queryKey: [
      'swap-network-fee',
      accountRequest.account.id,
      baseAmount,
      quote?.baseAmount,
      quote?.targetAmount,
      quote?.executionType,
      quote?.providerId,
      quote?.assetPath,
      state.slippage,
    ],
    queryFn: async ({ signal }) => {
      assertExistence(
        quote,
        `useNetworkFee expects a valid quote but got undefined.
         Ensure "quote" existence is specified in the "enabled" flag for useQuery.`
      );

      const executionData = await swapService.getSwapExecutionData(
        accountRequest,
        quote,
        BigNumber(state.slippage),
        signal
      );

      const executionDependencies: SwapExecutionDependencies = {
        ...dependencies,
        derivedAmounts,
        isSendingMax,
        executionData,
      };

      const { getNetworkFee } = getExecutionTypeStrategy(executionData.executionType);
      return await getNetworkFee(executionDependencies, signal);
    },
    select: data => {
      assertExistence(baseSwapAsset, "useNetworkFee expects 'baseSwapAsset' to be set.");
      return transformTransactionFees(
        data,
        baseSwapAsset.asset.protocol,
        state.feeTier,
        state.customFee
      );
    },
    enabled:
      isDefined(quote) && isQuoteAlignedWithCurrentInput(quote.baseAmount, derivedAmounts.crypto),
  });
}
