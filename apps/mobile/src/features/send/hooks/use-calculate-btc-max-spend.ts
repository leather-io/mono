import { useCallback } from 'react';

import { createCoinSelectionUtxos } from '@/features/send/utils';

import { calculateMaxSpend } from '@leather.io/bitcoin';
import { AverageBitcoinFeeRates } from '@leather.io/models';
import type { Utxo } from '@leather.io/query';

interface CalculateBtcMaxSpendParams {
  recipient: string;
  feeRate: number;
}

export type CalculateBtcMaxSpend = ReturnType<typeof useCalculateBtcMaxSpend>;

export function useCalculateBtcMaxSpend(feeRates: AverageBitcoinFeeRates, utxos: Utxo[]) {
  return useCallback(
    ({ recipient, feeRate }: CalculateBtcMaxSpendParams) =>
      calculateMaxSpend({
        recipient,
        utxos: createCoinSelectionUtxos(utxos),
        feeRate,
        feeRates,
      }),
    [feeRates, utxos]
  );
}
