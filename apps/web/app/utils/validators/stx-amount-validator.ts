import BigNumber from 'bignumber.js';
import { z } from 'zod';
import { UI_IMPOSED_MAX_STACKING_AMOUNT_USTX } from '~/constants/constants';
import { content } from '~/data/content';

import { stxToMicroStx } from '@leather.io/utils';

export function stxAmountSchema() {
  return z.coerce
    .number({
      required_error: content.validationMessages.enterAmount,
      invalid_type_error: content.validationMessages.invalidAmount,
    })
    .positive(content.validationMessages.mustStackAmount);
}

export function validateMinStackingAmount(value: number, minimumDelegationAmount: number) {
  const enteredAmount = stxToMicroStx(value || 0);
  return enteredAmount.isGreaterThanOrEqualTo(minimumDelegationAmount);
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
