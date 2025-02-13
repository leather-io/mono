import { t } from '@lingui/macro';

import { BitcoinErrorKey } from '@leather.io/bitcoin';
import { match } from '@leather.io/utils';

export function formatBitcoinError(errorMessage: BitcoinErrorKey) {
  return match<BitcoinErrorKey>()(errorMessage, {
    InvalidAddress: t({
      id: 'bitcoin-error.invalid-address',
      message: 'Invalid addressddd',
    }),
    NoInputsToSign: t({
      id: 'bitcoin-error.no-inputs-to-sign',
      message: 'No inputs to sign',
    }),
    NoOutputsToSign: t({
      id: 'bitcoin-error.no-outputs-to-sign',
      message: 'No outputs to sign',
    }),
    InsufficientFunds: t({
      id: 'bitcoin-error.insufficient-funds',
      message: 'Insufficient funds',
    }),
    InvalidNetworkAddress: t({
      id: 'bitcoin-error.invalid-network-address',
      message: 'Address is for incorrect network',
    }),
  });
}
