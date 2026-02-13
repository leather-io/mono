import { useMemo } from 'react';

import {
  type DetermineUtxosForSpendArgs,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from '@leather.io/bitcoin';
import { BtcFeeType, type Money, type OwnedUtxo, btcTxTimeMap } from '@leather.io/models';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useCurrentBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useAverageBitcoinFeeRates } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';

import { FeesListItem } from './bitcoin-fees-list';

function getFeeForList(
  determineUtxosForFeeArgs: DetermineUtxosForSpendArgs<OwnedUtxo>,
  isSendingMax?: boolean
) {
  try {
    const { fee } = isSendingMax
      ? determineUtxosForSpendAll(determineUtxosForFeeArgs)
      : determineUtxosForSpend(determineUtxosForFeeArgs);
    return fee;
  } catch {
    return null;
  }
}

interface UseBitcoinFeesListArgs {
  amount: Money;
  isSendingMax?: boolean;
  recipient: string;
  utxos: OwnedUtxo[];
}

export function useBitcoinFeesList({
  amount,
  isSendingMax,
  recipient,
  utxos,
}: UseBitcoinFeesListArgs) {
  const { btc: balance } = useCurrentBtcBalanceWithFallback();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const { data: feeRates, isLoading } = useAverageBitcoinFeeRates();

  const feesList: FeesListItem[] = useMemo(() => {
    function getFiatFeeValue(fee: Money) {
      return `~ ${formatCurrency(baseCurrencyAmountInQuote(fee, btcMarketData))}`;
    }

    if (!feeRates || !utxos.length) return [];

    const determineUtxosDefaultArgs = {
      recipients: [
        { address: recipient, amount: isSendingMax ? balance.availableBalance : amount },
      ],
      utxos,
    };

    const determineUtxosForHighFeeArgs = {
      ...determineUtxosDefaultArgs,
      feeRate: feeRates.fastestFee.toNumber(),
    };

    const determineUtxosForStandardFeeArgs = {
      ...determineUtxosDefaultArgs,
      feeRate: feeRates.halfHourFee.toNumber(),
    };

    const determineUtxosForLowFeeArgs = {
      ...determineUtxosDefaultArgs,
      feeRate: feeRates.hourFee.toNumber(),
    };

    const feesArr = [];

    const highFee = getFeeForList(determineUtxosForHighFeeArgs, isSendingMax);
    const standardFee = getFeeForList(determineUtxosForStandardFeeArgs, isSendingMax);
    const lowFee = getFeeForList(determineUtxosForLowFeeArgs, isSendingMax);

    if (highFee) {
      feesArr.push({
        label: BtcFeeType.High,
        value: highFee.amount.toNumber(),
        btcValue: formatCurrency(highFee, { preset: 'pad-decimals' }),
        time: btcTxTimeMap.fastestFee,
        fiatValue: getFiatFeeValue(highFee),
        feeRate: feeRates.fastestFee.toNumber(),
      });
    }

    if (standardFee) {
      feesArr.push({
        label: BtcFeeType.Standard,
        value: standardFee.amount.toNumber(),
        btcValue: formatCurrency(standardFee, { preset: 'pad-decimals' }),
        time: btcTxTimeMap.halfHourFee,
        fiatValue: getFiatFeeValue(standardFee),
        feeRate: feeRates.halfHourFee.toNumber(),
      });
    }

    if (lowFee) {
      feesArr.push({
        label: BtcFeeType.Low,
        value: lowFee.amount.toNumber(),
        btcValue: formatCurrency(lowFee, { preset: 'pad-decimals' }),
        time: btcTxTimeMap.hourFee,
        fiatValue: getFiatFeeValue(lowFee),
        feeRate: feeRates.hourFee.toNumber(),
      });
    }

    return feesArr;
  }, [feeRates, utxos, recipient, isSendingMax, balance.availableBalance, amount, btcMarketData]);

  return {
    feesList,
    isLoading,
  };
}
