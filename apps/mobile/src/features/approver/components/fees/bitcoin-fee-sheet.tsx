import { RefObject } from 'react';

import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import BigNumber from 'bignumber.js';

import { AverageBitcoinFeeRates, FeeTypes } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney } from '@leather.io/utils';

import { BitcoinFeeOption } from './bitcoin-fee-option';
import { FeeSheetLayout } from './fee-sheet.layout';

const feeTypes = [FeeTypes.Low, FeeTypes.Middle, FeeTypes.High, FeeTypes.Custom];

interface FeesSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  selectedFeeType: FeeTypes;
  fees: AverageBitcoinFeeRates | undefined;
  txSize: number;
  currentFeeRate: number;
  onChangeFee(feeType: FeeTypes): void;
}

export function BitcoinFeesSheet({
  sheetRef,
  selectedFeeType,
  fees,
  txSize,
  currentFeeRate,
  onChangeFee,
}: FeesSheetProps) {
  const { data: btcMarketData } = useBtcMarketDataQuery();

  function convertFeeToQuote(fee: number) {
    return baseCurrencyAmountInQuoteWithFallback(createMoney(fee, 'BTC'), btcMarketData);
  }

  function getFee(feeType: FeeTypes) {
    const feeRate = {
      [FeeTypes.Low]: fees?.hourFee ?? BigNumber(0),
      [FeeTypes.Middle]: fees?.halfHourFee ?? BigNumber(0),
      [FeeTypes.High]: fees?.fastestFee ?? BigNumber(0),
      [FeeTypes.Unknown]: BigNumber(0),
      [FeeTypes.Custom]: BigNumber(currentFeeRate),
    }[feeType];
    const fee = txSize * feeRate.toNumber();
    return { feeRate, fee };
  }

  function handleFeeChange(feeType: FeeTypes) {
    onChangeFee(feeType);
    sheetRef.current?.close();
  }

  return (
    <FeeSheetLayout sheetRef={sheetRef}>
      {feeTypes.map(feeType => {
        const { feeRate, fee } = getFee(feeType);
        return (
          <BitcoinFeeOption
            isSelected={selectedFeeType === feeType}
            disabled={feeType === FeeTypes.Custom}
            onPress={() => handleFeeChange(feeType)}
            key={feeType}
            feeType={feeType}
            feeRate={feeRate.toNumber()}
            fee={fee}
            quoteFee={convertFeeToQuote(fee)}
          />
        );
      })}
    </FeeSheetLayout>
  );
}
