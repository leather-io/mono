import { z } from 'zod';

import { BTC_DECIMALS, STX_DECIMALS } from '@leather.io/constants';
import { countDecimals, isNumber } from '@leather.io/utils';

import { FormErrorMessages } from '@shared/error-messages';

export function currencyAmountValidator() {
  return z.refine<number | undefined>(value => value === undefined || value > 0, {
    error: FormErrorMessages.MustBePositive,
  });
}

function currencyPrecisionValidatorFactory(precision: number, errorMessage: string) {
  return z.refine<number | undefined>(
    value => {
      if (!isNumber(value)) return false;
      return countDecimals(value) <= precision;
    },
    { error: errorMessage }
  );
}

export function btcAmountPrecisionValidator(errorMsg: string) {
  return currencyPrecisionValidatorFactory(BTC_DECIMALS, errorMsg);
}

export function stxAmountPrecisionValidator(errorMsg: string) {
  return currencyPrecisionValidatorFactory(STX_DECIMALS, errorMsg);
}
