import BigNumber from 'bignumber.js';
import { z } from 'zod';

import { BTC_DECIMALS } from '@leather.io/constants';
import { UtxoResponseItem } from '@leather.io/query';
import { btcToSat, satToBtc } from '@leather.io/utils';

import { FormErrorMessages, currencyPrecisionValidatorFactory } from './common.validation';

const minSpendAmountInSats = 546;

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
        // FIXME: LEA-1647 - move to packages
        /* eslint-disable-next-line lingui/no-unlocalized-strings  */
        message: `Minimum is ${satToBtc(minSpendAmountInSats)}`,
      }
    );
}
// btc and stx doing the same thing basically so just use currencyPrecisionValidatorFactory
export function btcAmountPrecisionValidator(errorMsg: string) {
  return currencyPrecisionValidatorFactory(BTC_DECIMALS, errorMsg);
}
