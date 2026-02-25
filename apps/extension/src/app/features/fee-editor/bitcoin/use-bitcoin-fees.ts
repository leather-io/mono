import { useMemo } from 'react';

import { type TransactionFees, btcTxTimeMap, getBitcoinFeeRate } from '@leather.io/models';

import { type Fees } from '../fee-editor.context';

interface UseBitcoinFeesArgs {
  feeRates?: TransactionFees;
}
export function useBitcoinFees({ feeRates }: UseBitcoinFeesArgs) {
  return useMemo<Fees | undefined>(() => {
    if (!feeRates) return;

    const { low, standard, high } = feeRates.options;

    return {
      slow: {
        priority: 'slow',
        feeRate: getBitcoinFeeRate(low),
        txFee: low.value,
        time: btcTxTimeMap.hourFee,
      },
      standard: {
        priority: 'standard',
        feeRate: getBitcoinFeeRate(standard),
        txFee: standard.value,
        time: btcTxTimeMap.halfHourFee,
      },
      fast: {
        priority: 'fast',
        feeRate: getBitcoinFeeRate(high),
        txFee: high.value,
        time: btcTxTimeMap.fastestFee,
      },
      custom: {
        priority: 'custom',
        feeRate: getBitcoinFeeRate(standard),
        txFee: standard.value,
        time: '',
      },
    };
  }, [feeRates]);
}
