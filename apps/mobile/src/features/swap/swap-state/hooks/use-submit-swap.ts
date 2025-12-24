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

import { Money } from '@leather.io/models';

import { TrackEvent } from '../swap-state.types';
import { isQuoteAlignedWithCurrentInput } from '../utils/is-quote-aligned-with-current-input';

interface UseSubmitSwapProps {
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  nonce: number;
  isSendingMax: boolean;
  spendableAmountQuery: UseQueryResult<Money | null, Error>;
  networkFeeQuery: UseQueryResult<NetworkFee, Error>;
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  dependencies: SwapDependencies;
  validation: ValidationResult;
  trackEvent: TrackEvent;
}

interface SwapSubmissionPrerequisites {
  quote: NonNullable<SwapQuoteSelectionResult['selected']>;
  networkFee: NetworkFee;
}

export function useSubmitSwap({
  dependencies,
  derivedAmounts,
  isSendingMax,
  nonce,
  validation,
  spendableAmountQuery,
  networkFeeQuery,
  quoteQuery,
  state,
  trackEvent,
}: UseSubmitSwapProps) {
  const { accountRequest, services } = dependencies;
  const { swapService } = services;

  const readiness = checkSwapReadiness(
    spendableAmountQuery,
    networkFeeQuery,
    quoteQuery,
    validation,
    derivedAmounts
  );

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      if (!readiness.canSubmit) {
        throw new Error('submit() called when canSubmit=false. Use the canSubmit guard');
      }

      const { quote, networkFee } = readiness.prerequisites;

      trackEvent('swap_submitted', {
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
      await strategy.submitSwap(executionDependencies, networkFee);
    },
    onSuccess() {
      if (!readiness.canSubmit) return;
      const { quote } = readiness.prerequisites;
      trackEvent('swap_submission_success', {
        baseSymbol: quote.baseAsset.symbol,
        targetSymbol: quote.targetAsset.symbol,
        baseAmount: quote.baseAmount.amount.toNumber(),
        targetAmount: quote.targetAmount.amount.toNumber(),
        provider: quote.provider,
      });
    },
    onError(error) {
      if (!readiness.canSubmit) return;
      const { quote } = readiness.prerequisites;
      trackEvent('swap_submission_failure', {
        baseSymbol: quote.baseAsset.symbol,
        targetSymbol: quote.targetAsset.symbol,
        errorMessage: isError(error) ? error.message : 'unknown',
        provider: quote.provider,
      });
    },
  });

  return {
    submit: mutateAsync,
    canSubmit: readiness.canSubmit,
  };
}

type SwapReadinessResult =
  | { canSubmit: true; prerequisites: SwapSubmissionPrerequisites }
  | { canSubmit: false };

function checkSwapReadiness(
  spendableAmountQuery: UseQueryResult<Money | null, Error>,
  networkFeeQuery: UseQueryResult<NetworkFee, Error>,
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>,
  validation: ValidationResult,
  derivedAmounts: DerivedAmounts
): SwapReadinessResult {
  const selectedQuote = quoteQuery.data?.selected;

  if (
    !spendableAmountQuery.isFetching &&
    spendableAmountQuery.isSuccess &&
    !networkFeeQuery.isFetching &&
    networkFeeQuery.isSuccess &&
    !quoteQuery.isRefetching &&
    isDefined(selectedQuote) &&
    validation.isValid &&
    isQuoteAlignedWithCurrentInput(selectedQuote.baseAmount, derivedAmounts.crypto)
  ) {
    return {
      canSubmit: true,
      prerequisites: {
        quote: selectedQuote,
        networkFee: networkFeeQuery.data,
      },
    };
  }

  return { canSubmit: false };
}
