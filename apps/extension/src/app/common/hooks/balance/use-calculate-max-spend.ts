import { useCallback } from 'react';

import BigNumber from 'bignumber.js';

import { type CalculateMaxSpendResponse, calculateMaxSpend } from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';
import { getInputSizing } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import { useBitcoinFeeRates } from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

export function useCalculateMaxBitcoinSpend() {
  const { data: feeRates } = useBitcoinFeeRates();
  const account = useCurrentAccountAddresses();
  const defaultFeeRate = feeRates?.standard.rate;

  return useCallback(
    (address = '', utxos: OwnedUtxo[], feeRate?: number): CalculateMaxSpendResponse => {
      const rate = feeRate ?? defaultFeeRate;
      if (!rate)
        return {
          spendAllFee: 0,
          amount: createMoney(0, 'BTC'),
          spendableBitcoin: new BigNumber(0),
        };
      return calculateMaxSpend({
        recipient: address,
        utxos,
        feeRate: rate,
        inputSizing: getInputSizing(account),
      });
    },
    [defaultFeeRate, account]
  );
}
