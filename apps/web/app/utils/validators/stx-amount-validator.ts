import BigNumber from 'bignumber.js';
import { z } from 'zod';
import { UI_IMPOSED_MAX_STACKING_AMOUNT_USTX } from '~/constants/constants';
import { validationMessages } from '~/content/messages';

import { stxToMicroStx } from '@leather.io/utils';

export function stxAmountSchema() {
  return z.coerce
    .number({
      error: issue =>
        issue.input === undefined
          ? validationMessages.enterAmount
          : validationMessages.invalidAmount,
    })
    .positive(validationMessages.mustStackAmount)
    .refine(value => validateStxAmountPrecision(value), validationMessages.amountTooPrecise);
}

export function validateStxAmountPrecision(value: number) {
  return stxToMicroStx(value).isInteger();
}

export function validateMaxStackingAmount(value: number) {
  if (value === undefined) return false;
  const enteredAmount = stxToMicroStx(value);
  return enteredAmount.isLessThanOrEqualTo(UI_IMPOSED_MAX_STACKING_AMOUNT_USTX);
}

export function validateAvailableBalance(value: number, availableBalance: BigNumber | undefined) {
  if (value === undefined || availableBalance === undefined) return false;
  const enteredAmount = stxToMicroStx(value);
  return enteredAmount.isLessThanOrEqualTo(availableBalance);
}
