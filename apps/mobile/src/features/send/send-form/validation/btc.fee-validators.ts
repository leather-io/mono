// TODO: LEA-1617 - this was unused in extension
import { Money } from '@leather.io/models';
import { btcToSat } from '@leather.io/utils';

import { btcAmountPrecisionValidator } from './btc.amount-validators';
import { feeValidatorFactory } from './common.validation';

// Maybe better to just get rid of this and simplify?
// ts-unused-exports:disable-next-line
export function btcFeeValidator(availableBalance?: Money) {
  return feeValidatorFactory({
    availableBalance,
    unitConverter: btcToSat,
    validator: btcAmountPrecisionValidator,
  });
}
