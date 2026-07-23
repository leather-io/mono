import { useCallback } from 'react';

import { determineUtxosForSpend, determineUtxosForSpendAll } from '@leather.io/bitcoin';
import { getInputSizing } from '@leather.io/services';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import type { TransferRecipient } from '@shared/models/form.model';

import { formatCurrency } from '@app/common/currency-formatter';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

export const MAX_FEE_RATE_MULTIPLIER = 50;

interface UseBitcoinCustomFeeArgs {
  isSendingMax: boolean;
  recipients: TransferRecipient[];
}

/**
 * TODO: refactor this bit
 * This hook uses utxos that are not necessarily present in the transaction
 */
export function useBitcoinCustomFee({ isSendingMax, recipients }: UseBitcoinCustomFeeArgs) {
  const { utxos } = useCurrentUtxos();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const account = useCurrentAccountAddresses();

  return useCallback(
    (feeRate: number) => {
      if (!feeRate || !utxos.available.length) return { fee: 0, fiatFeeValue: '' };

      const determineUtxosArgs = {
        recipients,
        utxos: utxos.available,
        feeRate,
        inputSizing: getInputSizing(account),
      };
      const { fee } = isSendingMax
        ? determineUtxosForSpendAll(determineUtxosArgs)
        : determineUtxosForSpend(determineUtxosArgs);

      return {
        fee: fee.amount.toNumber(),
        fiatFeeValue: `~ ${formatCurrency(baseCurrencyAmountInQuote(fee, btcMarketData))}`,
      };
    },
    [utxos, isSendingMax, recipients, btcMarketData, account]
  );
}
