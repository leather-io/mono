import { useCallback, useMemo } from 'react';

import { BtcFeeType, InscriptionAsset, btcTxTimeMap } from '@leather.io/models';
import { type UtxoWithDerivationPath } from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { FeesListItem } from '@app/components/bitcoin-fees-list/bitcoin-fees-list';
import { useBitcoinFeeRates } from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { useGenerateUnsignedOrdinalTx } from './use-generate-ordinal-tx';

interface UseSendInscriptionFeesListArgs {
  recipient: string;
  utxo: UtxoWithDerivationPath;
  inscription: InscriptionAsset;
}

export function useSendInscriptionFeesList({
  recipient,
  utxo,
  inscription,
}: UseSendInscriptionFeesListArgs) {
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  const { utxos } = useCurrentUtxos();

  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');

  const { data: feeRates, isLoading } = useBitcoinFeeRates();

  const { coverFeeFromAdditionalUtxos } = useGenerateUnsignedOrdinalTx(utxo);

  const getTransactionFee = useCallback(
    (feeRate: number) => {
      try {
        const tx = coverFeeFromAdditionalUtxos({
          recipient,
          feeRate,
          inscription,
        });

        return tx?.txFee;
      } catch {
        return null;
      }
    },
    [coverFeeFromAdditionalUtxos, recipient, inscription]
  );

  const feesList: FeesListItem[] = useMemo(() => {
    function getFiatFeeValue(fee: number) {
      return `~ ${formatCurrency(
        baseCurrencyAmountInQuote(createMoney(Math.ceil(fee), 'BTC'), btcMarketData)
      )}`;
    }

    const nativeSegwitPayer = createNativeSegwitPayer?.({ addressIndex: 0, changeIndex: 0 });

    if (!feeRates || !utxos || !nativeSegwitPayer) return [];

    const highRate = feeRates.high.rate;
    const standardRate = feeRates.standard.rate;
    const lowRate = feeRates.low.rate;

    const highFeeValue = getTransactionFee(highRate);
    const standardFeeValue = getTransactionFee(standardRate);
    const lowFeeValue = getTransactionFee(lowRate);

    const feesArr = [];

    if (highFeeValue) {
      feesArr.push({
        label: BtcFeeType.High,
        value: highFeeValue,
        btcValue: formatCurrency(createMoney(highFeeValue, 'BTC'), { preset: 'pad-decimals' }),
        time: btcTxTimeMap.fastestFee,
        fiatValue: getFiatFeeValue(highFeeValue),
        feeRate: highRate,
      });
    }

    if (standardFeeValue) {
      feesArr.push({
        label: BtcFeeType.Standard,
        value: standardFeeValue,
        btcValue: formatCurrency(createMoney(standardFeeValue, 'BTC'), { preset: 'pad-decimals' }),
        time: btcTxTimeMap.halfHourFee,
        fiatValue: getFiatFeeValue(standardFeeValue),
        feeRate: standardRate,
      });
    }

    if (lowFeeValue) {
      feesArr.push({
        label: BtcFeeType.Low,
        value: lowFeeValue,
        btcValue: formatCurrency(createMoney(lowFeeValue, 'BTC'), { preset: 'pad-decimals' }),
        time: btcTxTimeMap.hourFee,
        fiatValue: getFiatFeeValue(lowFeeValue),
        feeRate: lowRate,
      });
    }

    return feesArr;
  }, [feeRates, utxos, btcMarketData, createNativeSegwitPayer, getTransactionFee]);

  return {
    feesList,
    isLoading,
  };
}
