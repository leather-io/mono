import { useCallback, useMemo } from 'react';

import BigNumber from 'bignumber.js';
import { FEE_RATE } from '~/constants/constants';

export function useFeeRate() {
  return useMemo(() => ({ feeRate: FEE_RATE }), []);
}
/**
 * Returns a function calculating how much of a fee should be set
 * based on the number of bytes of the transaction.
 */
export function useCalculateFee() {
  const { feeRate } = useFeeRate();
  return useCallback(
    (bytes: number) => BigInt(new BigNumber(feeRate).multipliedBy(bytes).toString()),
    [feeRate]
  );
}
