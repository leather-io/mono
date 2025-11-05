import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';

export function isQuoteAlignedWithCurrentInput(
  quoteBaseAmount: number | undefined,
  input: Money | null
): boolean {
  if (quoteBaseAmount == null || !input) return false;

  const decimals = input.decimals;
  const quoteQuantized = BigNumber(quoteBaseAmount.toFixed(decimals));
  return input.amount.shiftedBy(-decimals).isEqualTo(quoteQuantized);
}
