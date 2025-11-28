import { getExecutionTypeStrategy } from '@/features/swap/swap-state/strategies/execution-type/execution-type';
import {
  DerivedAmounts,
  NetworkFee,
  SwapDependencies,
  SwapExecutionDependencies,
  SwapInternalState,
  SwapQuoteSelectionResult,
} from '@/features/swap/swap-state/swap-state.types';
import { ValidationResult } from '@/features/swap/swap-state/validation/swap-validation';
import { UseQueryResult, useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { isDefined, isError } from 'remeda';

import { TrackEvent } from '../swap-state.types';
import { isQuoteAlignedWithCurrentInput } from '../utils/is-quote-aligned-with-current-input';

interface UseExecuteSwapProps {
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  nonce: number;
  isSendingMax: boolean;
  networkFeeQuery: UseQueryResult<NetworkFee, Error>;
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  dependencies: SwapDependencies;
  validation: ValidationResult;
  trackEvent: TrackEvent;
}

interface SwapExecutionPrerequisites {
  quote: NonNullable<SwapQuoteSelectionResult['selected']>;
  networkFee: NetworkFee;
}

export function useExecuteSwap({
  dependencies,
  derivedAmounts,
  isSendingMax,
  nonce,
  validation,
  networkFeeQuery,
  quoteQuery,
  state,
  trackEvent,
}: UseExecuteSwapProps) {
  const { accountRequest, services } = dependencies;
  const { swapService } = services;

  const executability = determineSwapExecutability(
    networkFeeQuery,
    quoteQuery,
    validation,
    derivedAmounts
  );

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      if (!executability.canExecute) {
        throw new Error('execute() called when canExecute=false. Use the canExecute guard');
      }

      const { quote, networkFee } = executability.prerequisites;

      void trackEvent('swap_execution_started', {
        baseSymbol: quote.baseAsset.symbol,
        targetSymbol: quote.targetAsset.symbol,
        baseAmount: quote.baseAmount.amount.toNumber(),
        targetAmount: quote.targetAmount.amount.toNumber(),
        provider: quote.provider,
      });

      const executionData = await swapService.getSwapExecutionData(
        accountRequest,
        quote.rawSwapQuote,
        BigNumber(state.slippage)
      );
      const executionDependencies: SwapExecutionDependencies = {
        ...dependencies,
        derivedAmounts,
        isSendingMax,
        executionData,
        nonce,
      };
      const strategy = getExecutionTypeStrategy(executionData.executionType);
      await strategy.executeSwap(executionDependencies, networkFee);
    },
    onSuccess() {
      if (!executability.canExecute) return;
      const { quote } = executability.prerequisites;
      void trackEvent('swap_execution_success', {
        baseSymbol: quote.baseAsset.symbol,
        targetSymbol: quote.targetAsset.symbol,
        baseAmount: quote.baseAmount.amount.toNumber(),
        targetAmount: quote.targetAmount.amount.toNumber(),
        provider: quote.provider,
      });
    },
    onError(error) {
      if (!executability.canExecute) return;
      const { quote } = executability.prerequisites;
      void trackEvent('swap_execution_failure', {
        baseSymbol: quote.baseAsset.symbol,
        targetSymbol: quote.targetAsset.symbol,
        errorMessage: isError(error) ? error.message : 'unknown',
        provider: quote.provider,
      });
    },
  });

  return {
    execute: mutateAsync,
    canExecute: executability.canExecute,
  };
}

type SwapExecutabilityResult =
  | { canExecute: true; prerequisites: SwapExecutionPrerequisites }
  | { canExecute: false };

function determineSwapExecutability(
  networkFeeQuery: UseQueryResult<NetworkFee, Error>,
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>,
  validation: ValidationResult,
  derivedAmounts: DerivedAmounts
): SwapExecutabilityResult {
  const selectedQuote = quoteQuery.data?.selected;

  if (
    !networkFeeQuery.isFetching &&
    networkFeeQuery.isSuccess &&
    !quoteQuery.isRefetching &&
    isDefined(selectedQuote) &&
    validation.isValid &&
    isQuoteAlignedWithCurrentInput(selectedQuote.baseAmount, derivedAmounts.crypto)
  ) {
    return {
      canExecute: true,
      prerequisites: {
        quote: selectedQuote,
        networkFee: networkFeeQuery.data,
      },
    };
  }

  return { canExecute: false };
}
