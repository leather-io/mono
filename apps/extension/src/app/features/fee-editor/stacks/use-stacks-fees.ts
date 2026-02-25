import { useMemo } from 'react';

import type { StacksTransactionFees } from '@leather.io/models';
import { convertAmountToBaseUnit } from '@leather.io/utils';

import { type Fees as StacksFees } from '../fee-editor.context';

const stacksFeePriorityTimeMap = {
  slow: '1–2 minutes',
  standard: '20–30 seconds',
  fast: '10 seconds',
  custom: '',
} as const;

interface UseStacksFeesArgs {
  fees?: StacksTransactionFees;
}
export function useStacksFees({ fees }: UseStacksFeesArgs) {
  return useMemo<StacksFees | undefined>(() => {
    if (!fees) return;

    const { low, standard, high } = fees.options;

    return {
      slow: {
        priority: 'slow',
        feeValue: convertAmountToBaseUnit(low.value).toNumber(),
        txFee: low.value,
        time: stacksFeePriorityTimeMap.slow,
      },
      standard: {
        priority: 'standard',
        feeValue: convertAmountToBaseUnit(standard.value).toNumber(),
        txFee: standard.value,
        time: stacksFeePriorityTimeMap.standard,
      },
      fast: {
        priority: 'fast',
        feeValue: convertAmountToBaseUnit(high.value).toNumber(),
        txFee: high.value,
        time: stacksFeePriorityTimeMap.fast,
      },
      // Load custom as standard fee
      custom: {
        priority: 'custom',
        feeValue: convertAmountToBaseUnit(standard.value).toNumber(),
        txFee: standard.value,
        time: stacksFeePriorityTimeMap.custom,
      },
    };
  }, [fees]);
}
