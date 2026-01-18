import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { isDefined } from 'remeda';

import { type Money, type TransactionFeeTier } from '@leather.io/models';
import { type AccountSwapAsset } from '@leather.io/services';

import { getProtocolStrategy } from '../strategies/protocol/protocol';
import { type SwapDependencies } from '../swap-state.types';

interface UseSpendableAmountParams {
  dependencies: SwapDependencies;
  baseSwapAsset: AccountSwapAsset | null;
  feeTier: TransactionFeeTier;
  customFee: number | null;
}

export function useSpendableAmount({
  dependencies,
  baseSwapAsset,
  feeTier,
  customFee,
}: UseSpendableAmountParams): UseQueryResult<Money | null, Error> {
  const protocol = baseSwapAsset?.asset.protocol;
  const balance = baseSwapAsset?.balance?.crypto;

  return useQuery({
    queryKey: [
      'spendable-amount',
      protocol,
      dependencies.accountRequest.account.id,
      feeTier,
      customFee,
      balance?.availableBalance.amount.toString(),
    ],
    queryFn: async ({ signal }) => {
      if (!protocol || !balance) {
        return null;
      }

      const strategy = getProtocolStrategy(protocol);

      return strategy.resolveSpendableAmount({
        balance,
        dependencies,
        feeTier,
        customFee,
        signal,
      });
    },
    enabled: isDefined(baseSwapAsset?.balance),
  });
}
