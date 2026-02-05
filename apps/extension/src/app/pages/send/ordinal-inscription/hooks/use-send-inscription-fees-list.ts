import { useCallback, useMemo } from 'react';

import { BtcFeeType, InscriptionAsset, btcTxTimeMap } from '@leather.io/models';
import { type UtxoWithDerivationPath } from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { FeesListItem } from '@app/components/bitcoin-fees-list/bitcoin-fees-list';
import { useAverageBitcoinFeeRates } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
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
  const { utxos: nativeSegwitUtxos } = useCurrentNativeSegwitUtxos();

  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const { data: feeRates, isLoading } = useAverageBitcoinFeeRates();

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

    if (!feeRates || !nativeSegwitUtxos || !nativeSegwitPayer) return [];

    const highFeeValue = getTransactionFee(feeRates.fastestFee.toNumber());
    const standardFeeValue = getTransactionFee(feeRates.halfHourFee.toNumber());
    const lowFeeValue = getTransactionFee(feeRates.hourFee.toNumber());

    const feesArr = [];

    if (highFeeValue) {
      feesArr.push({
        label: BtcFeeType.High,
        value: highFeeValue,
        btcValue: formatCurrency(createMoney(highFeeValue, 'BTC'), { preset: 'pad-decimals' }),
        time: btcTxTimeMap.fastestFee,
        fiatValue: getFiatFeeValue(highFeeValue),
        feeRate: feeRates.fastestFee.toNumber(),
      });
    }

    if (standardFeeValue) {
      feesArr.push({
        label: BtcFeeType.Standard,
        value: standardFeeValue,
        btcValue: formatCurrency(createMoney(standardFeeValue, 'BTC'), { preset: 'pad-decimals' }),
        time: btcTxTimeMap.halfHourFee,
        fiatValue: getFiatFeeValue(standardFeeValue),
        feeRate: feeRates.halfHourFee.toNumber(),
      });
    }

    if (lowFeeValue) {
      feesArr.push({
        label: BtcFeeType.Low,
        value: lowFeeValue,
        btcValue: formatCurrency(createMoney(lowFeeValue, 'BTC'), { preset: 'pad-decimals' }),
        time: btcTxTimeMap.hourFee,
        fiatValue: getFiatFeeValue(lowFeeValue),
        feeRate: feeRates.hourFee.toNumber(),
      });
    }

    return feesArr;
  }, [feeRates, nativeSegwitUtxos, btcMarketData, createNativeSegwitPayer, getTransactionFee]);

  return {
    feesList,
    isLoading,
  };
}
