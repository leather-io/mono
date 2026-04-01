import BigNumber from 'bignumber.js';
import { AnyObject, NumberSchema } from 'yup';

import type { Money } from '@leather.io/models';
import { isNumber, stxToMicroStx } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { formatInsufficientBalanceError, formatPrecisionError } from '@app/common/error-formatters';
import { stxAmountPrecisionValidator } from '@app/common/validation/forms/currency-validators';

interface FeeValidatorFactoryArgs {
  availableBalance?: Money;
  unitConverter(unit: string | number | BigNumber): BigNumber;
  validator(errorMsg: string): NumberSchema<number | undefined, AnyObject>;
}
function feeValidatorFactory({
  availableBalance,
  unitConverter,
  validator,
}: FeeValidatorFactoryArgs) {
  return validator(formatPrecisionError(availableBalance)).test({
    message: formatInsufficientBalanceError(availableBalance, formatCurrency),
    test(fee: unknown) {
      if (!availableBalance || !isNumber(fee)) return false;
      return availableBalance.amount.isGreaterThanOrEqualTo(unitConverter(fee));
    },
  });
}

export function stxFeeValidator(availableBalance?: Money) {
  return feeValidatorFactory({
    availableBalance,
    unitConverter: stxToMicroStx,
    validator: stxAmountPrecisionValidator,
  });
}
