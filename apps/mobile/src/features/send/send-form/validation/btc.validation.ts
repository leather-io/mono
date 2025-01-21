import { t } from '@lingui/macro';

import { BitcoinErrorKey, minSpendAmountInSats } from '@leather.io/bitcoin';
import { match, satToBtc } from '@leather.io/utils';

const minimumBtcSpend = satToBtc(minSpendAmountInSats);

export function formatBitcoinError(errorMessage: BitcoinErrorKey) {
  return match<BitcoinErrorKey>()(errorMessage, {
    InsufficientFunds: t({
      id: 'bitcoin-error.insufficient-funds',
      message: 'Insufficient funds',
    }),
    InsufficientAmount: t({
      id: 'bitcoin-error.insufficient-amount',
      message: `Minimum is ${minimumBtcSpend}`,
    }),

    InvalidAddress: t({
      id: 'bitcoin-error.invalid-address',
      message: 'Invalid address',
    }),
    InvalidNetworkAddress: t({
      id: 'bitcoin-error.invalid-network-address',
      message: 'Address is for incorrect network',
    }),
    InvalidPrecision: t({
      id: 'bitcoin-error.invalid-precision',
      message: 'Invalid precision',
    }),
    InvalidTransaction: t({
      id: 'bitcoin-error.invalid-transaction',
      message: 'Attempted to generate raw tx, but no tx exists',
    }),
    NonCompliantAddress: t({
      id: 'bitcoin-error.non-compliant-address',
      message: 'Compliance check failed',
    }),
    NoInputsToSign: t({
      id: 'bitcoin-error.no-inputs-to-sign',
      message: 'No inputs to sign',
    }),
    NoOutputsToSign: t({
      id: 'bitcoin-error.no-outputs-to-sign',
      message: 'No outputs to sign',
    }),
  });
}
