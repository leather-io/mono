import { useCallback, useMemo } from 'react';

import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import type { TransferRecipient } from '@shared/models/form.model';

import { formatCurrency } from '@app/common/currency-formatter';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useNativeSegwitAccountRequest } from '@app/services/use-native-segwit-account-request';

import { getBitcoinCoinSelectionService } from '@leather.io/services';

export const MAX_FEE_RATE_MULTIPLIER = 50;

interface UseBitcoinCustomFeeArgs {
  isSendingMax: boolean;
  recipients: TransferRecipient[];
}

export function useBitcoinCustomFee({ isSendingMax, recipients }: UseBitcoinCustomFeeArgs) {
  const accountRequest = useNativeSegwitAccountRequest();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const coinSelectionService = useMemo(() => getBitcoinCoinSelectionService(), []);

  return useCallback(
    async (feeRate: number) => {
      if (!feeRate) return { fee: 0, fiatFeeValue: '' };

      const { fee } = await coinSelectionService.performCoinSelection(
        {
          account: accountRequest,
          feeRate,
          recipients,
          isMaxSpend: isSendingMax,
        },
        undefined
      );
      const feeValue = fee.amount.toNumber();

      return {
        fee: feeValue,
        fiatFeeValue: `~ ${formatCurrency(
          baseCurrencyAmountInQuote(createMoney(Math.ceil(feeValue), 'BTC'), btcMarketData)
        )}`,
      };
    },
    [accountRequest, btcMarketData, coinSelectionService, isSendingMax, recipients]
  );
}
