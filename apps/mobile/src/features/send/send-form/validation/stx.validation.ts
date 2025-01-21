import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';

import { StacksErrorKey } from '@leather.io/stacks';
import { match } from '@leather.io/utils';

interface TrackAnalyticsForErrorArgs {
  errorMessage: StacksErrorKey;
  address: string;
}
export function trackAnalyticsForError({ errorMessage, address }: TrackAnalyticsForErrorArgs) {
  switch (errorMessage) {
    case 'UnknownBalance':
      void analytics?.track('unable_to_read_available_balance_in_stx_validator');
      break;
    case 'UnknownFee':
      void analytics?.track('unable_to_read_fee_in_stx_validator');
      break;
    case 'NonCompliantAddress':
      void analytics?.track('non_compliant_entity_detected', { address });
      break;
    default:
      break;
  }
}

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
    InvalidAmount: t({
      id: 'stacks-error.invalid-amount',
      message: 'Invalid amount',
    }),
    UnknownBalance: t({
      id: 'stacks-error.unknown-balance',
      message: 'Available balance unknown',
    }),
    UnknownFee: t({
      id: 'stacks-error.unknown-fee',
      message: 'Unable to read current fee',
    }),
    UnknownAmount: t({
      id: 'stacks-error.unknown-amount',
      message: 'Unable to read amount',
    }),
  });
}
