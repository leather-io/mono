import BigNumber from 'bignumber.js';
import { z } from 'zod';

import { type BitcoinNetworkModes, UtxoResponseItem } from '@leather.io/models';
import { FormErrorMessages, btcToSat, satToBtc } from '@leather.io/utils';

import { BitcoinError } from '../validation/bitcoin-error';
import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from './address-validation';

const minSpendAmountInSats = 546;
// Pete - maybe this should become isValidBitcoinTransaction and also check fees etc
// can update it to use zod also?
// probably better to use zod than throwing errors here

export function isValidBitcoinTransaction(
  senderAddress: string,
  recipientAddress: string,
  network: BitcoinNetworkModes
) {
  if (!isValidBitcoinAddress(senderAddress) || !isValidBitcoinAddress(recipientAddress)) {
    throw new BitcoinError('InvalidAddress');
  }
  if (
    !isValidBitcoinNetworkAddress(senderAddress, network) ||
    !isValidBitcoinNetworkAddress(recipientAddress, network)
  ) {
    throw new BitcoinError('InvalidNetworkAddress');
  }
}

interface BtcInsufficientBalanceValidatorArgs {
  calcMaxSpend(
    recipient: string,
    utxos: UtxoResponseItem[]
  ): {
    spendableBitcoin: BigNumber;
  };
  recipient: string;
  utxos: UtxoResponseItem[];
}

// PETE - could still use zod like this but handle errors in a toast?
export function btcInsufficientBalanceValidator({
  calcMaxSpend,
  recipient,
  utxos,
}: BtcInsufficientBalanceValidatorArgs) {
  return z
    .number({
      invalid_type_error: FormErrorMessages.MustBeNumber,
    })
    .refine(
      value => {
        if (!value) return false;
        const maxSpend = calcMaxSpend(recipient, utxos);
        if (!maxSpend) return false;
        const desiredSpend = new BigNumber(value);
        if (desiredSpend.isGreaterThan(maxSpend.spendableBitcoin)) return false;
        return true;
      },
      {
        message: FormErrorMessages.InsufficientFunds,
      }
    );
}

export function btcMinimumSpendValidator() {
  return z
    .number({
      invalid_type_error: FormErrorMessages.MustBeNumber,
    })
    .refine(
      value => {
        if (!value) return false;
        const desiredSpend = btcToSat(value);
        if (desiredSpend.isLessThan(minSpendAmountInSats)) return false;
        return true;
      },
      {
        message: `Minimum is ${satToBtc(minSpendAmountInSats)}`,
      }
    );
}
