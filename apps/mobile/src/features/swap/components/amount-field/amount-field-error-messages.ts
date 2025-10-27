import { BaseAmountIssue } from '@/features/swap/swap-state/validation/swap-validation';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { assertUnreachable } from '@leather.io/utils';

export function getAmountErrorMessage(issue?: BaseAmountIssue): string | undefined {
  if (!issue) return undefined;

  switch (issue.code) {
    case 'REQUIRED':
      return t`Enter an amount`;
    case 'INVALID':
      return t`Invalid amount`;
    case 'PRECISION_INVALID': {
      const maxDecimals = issue.context.decimals;
      return t`Too many decimals (max ${maxDecimals})`;
    }
    case 'TOO_SMALL': {
      const formattedMinimum = formatCurrency(issue.context.minimum);
      return t`Minimum ${formattedMinimum}`;
    }
    case 'TOO_LARGE': {
      const formattedMaximum = formatCurrency(issue.context.maximum);
      return t`Maximum ${formattedMaximum}`;
    }
    case 'INSUFFICIENT_BALANCE':
      return t`Insufficient balance`;
    default:
      return assertUnreachable(issue);
  }
}
