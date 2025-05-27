import { useCallback } from 'react';

import { calculateMaxSpend } from '@leather.io/bitcoin';
import { AverageBitcoinFeeRates, OwnedUtxo } from '@leather.io/models';

interface CalculateBtcMaxSpendParams {
  recipient: string;
  feeRate: number;
}

export type CalculateBtcMaxSpend = ReturnType<typeof useCalculateBtcMaxSpend>;

export function useCalculateBtcMaxSpend(feeRates: AverageBitcoinFeeRates, utxos: OwnedUtxo[]) {
  return useCallback(
    ({ recipient, feeRate }: CalculateBtcMaxSpendParams) =>
      calculateMaxSpend({
        recipient,
        utxos,
        feeRate,
        feeRates,
      }),
    [feeRates, utxos]
  );
}
