import { useMemo } from 'react';

import {
  type BitcoinTransactionFeeQuote,
  BtcFeeType,
  type Money,
  btcTxTimeMap,
} from '@leather.io/models';
import type { AccountRequest } from '@leather.io/services';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useBitcoinTransactionFees } from '@app/query/bitcoin/fees/bitcoin-transaction-fees.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';

import { FeesListItem } from './bitcoin-fees-list';

function mapFeeQuoteToListItem(
  quote: BitcoinTransactionFeeQuote,
  label: BtcFeeType,
  time: string,
  getFiatFeeValue: (fee: Money) => string
): FeesListItem | null {
  return {
    label,
    value: quote.value.amount.toNumber(),
    btcValue: formatCurrency(quote.value, { preset: 'pad-decimals' }),
    time,
    fiatValue: getFiatFeeValue(quote.value),
    feeRate: quote.rate,
  };
}

interface UseBitcoinFeesListArgs {
  account: AccountRequest;
  amount: Money;
  isSendingMax?: boolean;
  recipient: string;
}

export function useBitcoinFeesList({
  account,
  amount,
  isSendingMax,
  recipient,
}: UseBitcoinFeesListArgs) {
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const { data: feeRates, isLoading } = useBitcoinTransactionFees({
    account,
    recipients: [{ address: recipient, amount }],
    isMaxSpend: isSendingMax,
  });

  const feesList: FeesListItem[] = useMemo(() => {
    function getFiatFeeValue(fee: Money) {
      return `~ ${formatCurrency(baseCurrencyAmountInQuote(fee, btcMarketData))}`;
    }

    if (!feeRates) return [];

    const { low, standard, high } = feeRates.options;

    const items = [
      mapFeeQuoteToListItem(high, BtcFeeType.High, btcTxTimeMap.fastestFee, getFiatFeeValue),
      mapFeeQuoteToListItem(
        standard,
        BtcFeeType.Standard,
        btcTxTimeMap.halfHourFee,
        getFiatFeeValue
      ),
      mapFeeQuoteToListItem(low, BtcFeeType.Low, btcTxTimeMap.hourFee, getFiatFeeValue),
    ];

    return items.filter((item): item is FeesListItem => item !== null);
  }, [feeRates, btcMarketData]);

  return {
    feesList,
    isLoading,
  };
}
