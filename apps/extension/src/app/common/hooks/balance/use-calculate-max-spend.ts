import { useCallback } from 'react';

import type { OwnedUtxo } from '@leather.io/models';
import { getInputSizing } from '@leather.io/services';

import { calculateMaxBitcoinSpend } from '@app/common/transactions/bitcoin/fees/calculate-max-bitcoin-spend';
import { useBitcoinFeeRates } from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

export function useCalculateMaxBitcoinSpend() {
  const { data: feeRates } = useBitcoinFeeRates();
  const account = useCurrentAccountAddresses();
  const defaultFeeRate = feeRates?.standard.rate;

  return useCallback(
    (address = '', utxos: OwnedUtxo[], feeRate?: number) =>
      calculateMaxBitcoinSpend({
        address,
        utxos,
        feeRate: feeRate ?? defaultFeeRate,
        inputSizing: getInputSizing(account),
      }),
    [defaultFeeRate, account]
  );
}
