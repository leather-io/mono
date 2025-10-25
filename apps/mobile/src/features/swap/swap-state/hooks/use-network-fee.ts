import {
  FeeDependencies,
  getExecutionTypeStrategy,
} from '@/features/swap/swap-state/strategies/execution-type/execution-type';
import { transformTransactionFees } from '@/features/swap/swap-state/strategies/transform-transaction-fees';
import {
  DerivedAmounts,
  NetworkFee,
  SwapInternalState,
} from '@/features/swap/swap-state/swap-state.types';
import { StacksNetwork } from '@stacks/network';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { isDefined } from 'remeda';

import { BitcoinNativeSegwitPayer } from '@leather.io/bitcoin';
import { NetworkConfiguration, SwapQuote } from '@leather.io/models';
import {
  AccountRequest,
  BitcoinTransactionFeesService,
  StacksTransactionFeesService,
  SwapService,
} from '@leather.io/services';
import { StacksSigner } from '@leather.io/stacks';
import { assertExistence } from '@leather.io/utils';

interface UseNetworkFeeProps {
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  isSendingMax: boolean;
  quote?: SwapQuote;
  baseAmount?: number;
  slippage: number;
  swapService: SwapService;
  stacksTransactionFeesService: StacksTransactionFeesService;
  bitcoinTransactionFeesService: BitcoinTransactionFeesService;
  bitcoinPayer: BitcoinNativeSegwitPayer;
  network: NetworkConfiguration;
  stacksNetwork: StacksNetwork;
  stacksSigner: StacksSigner;
  accountRequest: AccountRequest;
}

export function useNetworkFee({
  state,
  derivedAmounts,
  isSendingMax,
  swapService,
  quote,
  baseAmount,
  slippage,
  stacksTransactionFeesService,
  bitcoinTransactionFeesService,
  bitcoinPayer,
  network,
  stacksNetwork,
  stacksSigner,
  accountRequest,
}: UseNetworkFeeProps): UseQueryResult<NetworkFee, Error> {
  const { baseSwapAsset } = state;

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
      slippage,
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
        slippage,
        signal
      );

      const feeDependencies: FeeDependencies = {
        network,
        accountRequest,
        bitcoinTransactionFeesService,
        stacksTransactionFeesService,
        bitcoinPayer,
        stacksNetwork,
        stacksSigner,
        derivedAmounts,
        executionData,
        isSendingMax,
      };

      const { getNetworkFee } = getExecutionTypeStrategy(executionData.executionType);
      return await getNetworkFee(feeDependencies);
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
    enabled: isDefined(quote),
  });
}
