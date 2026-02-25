import { useCallback } from 'react';

import type { OwnedUtxo } from '@leather.io/models';

import { calculateMaxBitcoinSpend } from '@app/common/transactions/bitcoin/fees/calculate-max-bitcoin-spend';
import { useBitcoinFeeRates } from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';

export function useCalculateMaxBitcoinSpend() {
  const { data: feeRates } = useBitcoinFeeRates();
  const defaultFeeRate = feeRates?.standard.rate;

  return useCallback(
    (address = '', utxos: OwnedUtxo[], feeRate?: number) =>
      calculateMaxBitcoinSpend({
        address,
        utxos,
        feeRate,
        defaultFeeRate,
      }),
    [defaultFeeRate]
  );
}
