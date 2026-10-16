import type BigNumber from 'bignumber.js';
import { z } from 'zod';

import type { Money } from '@leather.io/models';
import { isNumber, stxToMicroStx } from '@leather.io/utils';

import { FormErrorMessages } from '@shared/error-messages';
import { requiredNumberField } from '@shared/forms/field-schemas';

import { formatCurrency } from '@app/common/currency-formatter';
import { formatInsufficientBalanceError, formatPrecisionError } from '@app/common/error-formatters';
import { stxAmountPrecisionValidator } from '@app/common/validation/forms/currency-validators';

interface FeeValidatorFactoryArgs {
  availableBalance?: Money;
  unitConverter(unit: string | number | BigNumber): BigNumber;
  validator(errorMsg: string): z.core.$ZodCheck<number | undefined>;
}
function feeValidatorFactory({
  availableBalance,
  unitConverter,
  validator,
}: FeeValidatorFactoryArgs) {
  return requiredNumberField({
    requiredError: FormErrorMessages.AmountRequired,
    typeError: FormErrorMessages.MustBeNumber,
  }).check(
    validator(formatPrecisionError(availableBalance)),
    z.refine<number | undefined>(
      fee => {
        if (!availableBalance || !isNumber(fee)) return false;
        return availableBalance.amount.isGreaterThanOrEqualTo(unitConverter(fee));
      },
      { error: formatInsufficientBalanceError(availableBalance, formatCurrency) }
    )
  );
}

export function stxFeeValidator(availableBalance?: Money) {
  return feeValidatorFactory({
    availableBalance,
    unitConverter: stxToMicroStx,
    validator: stxAmountPrecisionValidator,
  });
}
