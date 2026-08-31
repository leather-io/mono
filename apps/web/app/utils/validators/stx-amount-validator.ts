import BigNumber from 'bignumber.js';
import { UI_IMPOSED_MAX_STACKING_AMOUNT_USTX } from '~/constants/constants';

import { stxToMicroStx } from '@leather.io/utils';

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
