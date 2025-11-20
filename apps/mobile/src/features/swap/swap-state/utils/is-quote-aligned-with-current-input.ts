import { Money } from '@leather.io/models';

export function isQuoteAlignedWithCurrentInput(
  quoteBaseAmount: Money,
  input: Money | null
): boolean {
  if (!input) return false;

  return input.amount.isEqualTo(quoteBaseAmount.amount);
}
