import { useCallback } from 'react';

import BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import { type Money } from '@leather.io/models';
import { convertAmountToBaseUnit, createMoney, stxToMicroStx } from '@leather.io/utils';

const defaultStacksFeeMicroStx = 3000;

function calculateDefaultStacksFee() {
  return convertAmountToBaseUnit(createMoney(defaultStacksFeeMicroStx, 'STX'));
}

export type CalculateStxMaxSpend = ReturnType<typeof useCalculateStxMaxSpend>;

export function useCalculateStxMaxSpend(availableBalance: Money) {
  return useCallback(
    ({ fee = calculateDefaultStacksFee() } = {}) => {
      const result = availableBalance.amount.minus(stxToMicroStx(fee));
      return convertAmountToBaseUnit(BigNumber.max(result, 0), STX_DECIMALS);
    },

    [availableBalance]
  );
}
