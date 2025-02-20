import { useCallback } from 'react';

import BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { defaultStacksFees } from '@leather.io/query';
import { convertAmountToBaseUnit, createMoney, stxToMicroStx } from '@leather.io/utils';

function calculateDefaultStacksFee() {
  const defaultFeeFallback = 2500;
  const defaultFeeFallbackAsMoney = createMoney(defaultFeeFallback, 'STX');
  return convertAmountToBaseUnit(defaultStacksFees.estimates[1]?.fee ?? defaultFeeFallbackAsMoney);
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
