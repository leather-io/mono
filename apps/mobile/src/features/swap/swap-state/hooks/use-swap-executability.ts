import { useMemo } from 'react';

import { UseQueryResult } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';

import { SwapQuoteSelectionResult } from '../swap-state.types';

interface UseSwapExecutabilityParams {
  validation: { isValid: boolean };
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult>;
  derivedAmounts: { crypto: Money | null; quote: Money | null };
}

export function useSwapExecutability({
  validation,
  quoteQuery,
  derivedAmounts,
}: UseSwapExecutabilityParams) {
  const quoteBaseAmount = quoteQuery.data?.selected?.rawSwapQuote.baseAmount;
  const currentInput = derivedAmounts.crypto;

  return useMemo(
    () =>
      determineSwapExecutability({
        validation,
        isQuoteFetching: quoteQuery.isFetching,
        quoteBaseAmount,
        currentInput,
      }),
    [validation, quoteQuery.isFetching, quoteBaseAmount, currentInput]
  );
}

export interface SwapExecutabilityParams {
  validation: { isValid: boolean };
  isQuoteFetching: boolean;
  quoteBaseAmount: number | undefined;
  currentInput: Money | null;
}

export function determineSwapExecutability({
  validation,
  isQuoteFetching,
  quoteBaseAmount,
  currentInput,
}: SwapExecutabilityParams): boolean {
  return (
    validation.isValid &&
    !isQuoteFetching &&
    isQuoteAlignedWithCurrentInput(quoteBaseAmount, currentInput)
  );
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
