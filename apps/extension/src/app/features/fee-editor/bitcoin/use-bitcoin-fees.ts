import { useMemo } from 'react';

import {
  type BitcoinTransactionFeeQuote,
  type TransactionFees,
  btcTxTimeMap,
} from '@leather.io/models';

import { type Fees } from '../fee-editor.context';

interface UseBitcoinFeesArgs {
  feeRates?: TransactionFees<BitcoinTransactionFeeQuote>;
}
export function useBitcoinFees({ feeRates }: UseBitcoinFeesArgs) {
  return useMemo<Fees | undefined>(() => {
    if (!feeRates) return;

    const { low, standard, high } = feeRates.options;

    return {
      slow: {
        priority: 'slow',
        feeRate: low.rate,
        txFee: low.value,
        time: btcTxTimeMap.hourFee,
      },
      standard: {
        priority: 'standard',
        feeRate: standard.rate,
        txFee: standard.value,
        time: btcTxTimeMap.halfHourFee,
      },
      fast: {
        priority: 'fast',
        feeRate: high.rate,
        txFee: high.value,
        time: btcTxTimeMap.fastestFee,
      },
      // Load custom as standard fee
      custom: {
        priority: 'custom',
        feeRate: standard.rate,
        txFee: standard.value,
        time: '',
      },
    };
  }, [feeRates]);
}
