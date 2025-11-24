import { useCallback } from 'react';

import { determineUtxosForSpend, determineUtxosForSpendAll } from '@leather.io/bitcoin';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import type { TransferRecipient } from '@shared/models/form.model';

import { formatCurrency } from '@app/common/currency-formatter';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';

export const MAX_FEE_RATE_MULTIPLIER = 50;

interface UseBitcoinCustomFeeArgs {
  isSendingMax: boolean;
  recipients: TransferRecipient[];
}

export function useBitcoinCustomFee({ isSendingMax, recipients }: UseBitcoinCustomFeeArgs) {
  const { utxos } = useCurrentNativeSegwitUtxos();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');

  return useCallback(
    (feeRate: number) => {
      if (!feeRate || !utxos.available.length) return { fee: 0, fiatFeeValue: '' };

      const determineUtxosArgs = {
        recipients,
        utxos: utxos.available,
        feeRate,
      };
      const { fee } = isSendingMax
        ? determineUtxosForSpendAll(determineUtxosArgs)
        : determineUtxosForSpend(determineUtxosArgs);

      return {
        fee: fee.amount.toNumber(),
        fiatFeeValue: `~ ${formatCurrency(baseCurrencyAmountInQuote(fee, btcMarketData))}`,
      };
    },
    [utxos, isSendingMax, recipients, btcMarketData]
  );
}
