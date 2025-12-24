import { getProtocolStrategy } from '@/features/swap/swap-state/strategies/protocol/protocol';
import { SwapDependencies } from '@/features/swap/swap-state/swap-state.types';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { isDefined } from 'remeda';

import { Money, TransactionFeeTier } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

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
