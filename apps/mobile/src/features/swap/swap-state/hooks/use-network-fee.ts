import {
  FeeDependencies,
  getExecutionTypeStrategy,
} from '@/features/swap/swap-state/strategies/execution-type/execution-type';
import { getProtocolStrategy } from '@/features/swap/swap-state/strategies/protocol/protocol';
import { transformTransactionFees } from '@/features/swap/swap-state/strategies/transform-transaction-fees';
import {
  DerivedAmounts,
  NetworkFee,
  SwapInternalState,
} from '@/features/swap/swap-state/swap-state.types';
import { StacksNetwork } from '@stacks/network';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

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
  swapService: SwapService;
  quote?: SwapQuote;
  baseAmount?: number;
  slippage: number;
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
  const canonicalAmount = derivedAmounts.crypto?.amount.toString() ?? '0';

  const isQuoteInSyncWithUserInput = quote?.baseAmount === baseAmount;

  return useQuery({
    queryKey: [
      'swap-network-fee',
      {
        accountRequest,
        baseAmount,
        executionType: quote?.executionType,
        providerId: quote?.providerId,
        quoteBaseAmount: quote?.baseAmount,
        targetAmount: quote?.targetAmount,
        slippage,
      },
    ],
    queryFn: async ({ signal }) => {
      assertExistence(baseSwapAsset, '');
      assertExistence(quote, '');

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

      const getNetworkFee = getExecutionTypeStrategy(executionData.executionType).getNetworkFee;
      const feeCapabilities = getProtocolStrategy(
        baseSwapAsset.asset.protocol
      ).getFeeCapabilities();
      const transactionFees = await getNetworkFee(feeDependencies);

      return transformTransactionFees(transactionFees, feeCapabilities, state);
    },
    enabled: !!(baseSwapAsset && quote && isQuoteInSyncWithUserInput && canonicalAmount !== '0'),
  });
}
