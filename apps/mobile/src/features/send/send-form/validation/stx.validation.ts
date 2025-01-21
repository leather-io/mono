import { t } from '@lingui/macro';

import { StacksErrorKey } from '@leather.io/stacks';
import { match } from '@leather.io/utils';

export function formatStacksError(errorMessage: StacksErrorKey) {
  return match<StacksErrorKey>()(errorMessage, {
    InvalidAddress: t({
      id: 'stacks-error.invalid-address',
      message: 'Invalid address',
    }),
    InvalidNetworkAddress: t({
      id: 'stacks-error.invalid-network-address',
      message: 'Address is for incorrect network',
    }),
    InvalidSameAddress: t({
      id: 'stacks-error.invalid-same-address',
      message: 'Cannot send to yourself',
    }),
    InsufficientFunds: t({
      id: 'stacks-error.insufficient-funds',
      message: 'Insufficient funds',
    }),
    InvalidPrecision: t({
      id: 'stacks-error.invalid-precision',
      message: 'Invalid precision',
    }),
    InvalidTransaction: t({
      id: 'stacks-error.invalid-transaction',
      message: 'Attempted to generate raw tx, but no tx exists',
    }),
    NonCompliantAddress: t({
      id: 'stacks-error.non-compliant-address',
      message: 'Compliance check failed',
    }),
  });
}
