import { useCallback } from 'react';

import BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import { type Money } from '@leather.io/models';
import { convertAmountToBaseUnit } from '@leather.io/utils';

export type CalculateStxMaxSpend = ReturnType<typeof useCalculateStxMaxSpend>;

export function useCalculateStxMaxSpend(availableBalance: Money, fee: Money) {
  return useCallback(() => {
    const result = availableBalance.amount.minus(fee.amount);
    return convertAmountToBaseUnit(BigNumber.max(result, 0), STX_DECIMALS);
  }, [availableBalance, fee]);
}
