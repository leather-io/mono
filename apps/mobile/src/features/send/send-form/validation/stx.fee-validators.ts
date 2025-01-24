import type { Money } from '@leather.io/models';
import { stxToMicroStx } from '@leather.io/utils';

import { feeValidatorFactory } from './common.validation';
import { stxAmountPrecisionValidator } from './stx.amount-validators';

export function stxFeeValidator(availableBalance?: Money) {
  return feeValidatorFactory({
    availableBalance,
    unitConverter: stxToMicroStx,
    validator: stxAmountPrecisionValidator,
  });
}
