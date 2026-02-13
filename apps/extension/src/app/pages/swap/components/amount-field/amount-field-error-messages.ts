import { BaseAmountIssue } from '@leather.io/state/swap';
import { assertUnreachable } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

export function getAmountErrorMessage(issue?: BaseAmountIssue): string | undefined {
  if (!issue) return undefined;

  switch (issue.code) {
    case 'REQUIRED':
      return 'Enter an amount';
    case 'INVALID':
      return 'Invalid amount';
    case 'PRECISION_INVALID': {
      const maxDecimals = issue.context.decimals;
      return `Too many decimals (max ${maxDecimals})`;
    }
    case 'TOO_SMALL': {
      const formattedMinimum = formatCurrency(issue.context.minimum);
      return `Minimum ${formattedMinimum}`;
    }
    case 'TOO_LARGE': {
      const formattedMaximum = formatCurrency(issue.context.maximum);
      return `Maximum ${formattedMaximum}`;
    }
    case 'INSUFFICIENT_BALANCE':
      return 'Insufficient balance';
    default:
      return assertUnreachable(issue);
  }
}
