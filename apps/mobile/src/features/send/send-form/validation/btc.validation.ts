import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { BitcoinErrorKey, minSpendAmountInSats } from '@leather.io/bitcoin';
import { match, satToBtc } from '@leather.io/utils';

export function formatBitcoinError(errorMessage: BitcoinErrorKey) {
  const { i18n } = useLingui();
  return match<BitcoinErrorKey>()(errorMessage, {
    InsufficientFunds: t({
      id: 'bitcoin-error.insufficient-funds',
      message: 'Insufficient funds',
    }),
    InsufficientAmount: i18n._({
      id: 'bitcoin-error.insufficient-amount',
      message: '{amount}',
      values: { amount: satToBtc(minSpendAmountInSats) },
    }),
    InvalidAddress: t({
      id: 'bitcoin-error.invalid-address',
      message: 'Invalid address',
    }),
    InvalidNetworkAddress: t({
      id: 'bitcoin-error.invalid-network-address',
      message: 'Address is for incorrect network',
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
