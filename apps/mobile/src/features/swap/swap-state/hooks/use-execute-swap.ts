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
import { isDefined } from 'remeda';

import { Money } from '@leather.io/models';

interface UseExecuteSwapProps {
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  nonce: number;
  isSendingMax: boolean;
  networkFeeQuery: UseQueryResult<NetworkFee, Error>;
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  dependencies: SwapDependencies;
  validation: ValidationResult;
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
}: UseExecuteSwapProps) {
  const { accountRequest, services } = dependencies;
  const { swapService } = services;

  const executability = determineSwapExecutability({
    networkFeeQuery,
    quoteQuery,
    validation,
    derivedAmounts,
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (!executability.canExecute) return;

      const { quote, networkFee } = executability.prerequisites;
      const executionData = await swapService.getSwapExecutionData(
        accountRequest,
        quote.rawSwapQuote,
        state.slippage
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
  });

  return {
    execute: mutate,
    canExecute: executability.canExecute,
  };
}

function isQuoteAlignedWithCurrentInput(
  quoteBaseAmount: number | undefined,
  input: Money | null
): boolean {
  if (quoteBaseAmount == null || !input) return false;

  const decimals = input.decimals;
  const quoteQuantized = BigNumber(quoteBaseAmount.toFixed(decimals));
  return input.amount.shiftedBy(-decimals).isEqualTo(quoteQuantized);
}

function determineSwapExecutability(params: {
  networkFeeQuery: UseQueryResult<NetworkFee, Error>;
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  validation: ValidationResult;
  derivedAmounts: DerivedAmounts;
}): { canExecute: true; prerequisites: SwapExecutionPrerequisites } | { canExecute: false } {
  const { networkFeeQuery, quoteQuery, validation, derivedAmounts } = params;
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
