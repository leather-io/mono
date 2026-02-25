import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';

import { FeeTypes, type TransactionFees, getBitcoinFeeRate } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney } from '@leather.io/utils';

import { BitcoinFeeOption } from './bitcoin-fee-option';
import { FeeSheetLayout } from './fee-sheet.layout';

const feeTypes = [FeeTypes.Low, FeeTypes.Middle, FeeTypes.High, FeeTypes.Custom];

interface FeesSheetProps {
  sheetRef: SheetRef;
  selectedFeeType: FeeTypes;
  fees: TransactionFees | undefined;
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
    const rateMap: Record<FeeTypes, number> = {
      [FeeTypes.Low]: fees ? getBitcoinFeeRate(fees.options.low) : 0,
      [FeeTypes.Middle]: fees ? getBitcoinFeeRate(fees.options.standard) : 0,
      [FeeTypes.High]: fees ? getBitcoinFeeRate(fees.options.high) : 0,
      [FeeTypes.Unknown]: 0,
      [FeeTypes.Custom]: currentFeeRate,
    };
    const feeRate = rateMap[feeType];
    const fee = txSize * feeRate;
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
            feeRate={feeRate}
            fee={fee}
            quoteFee={convertFeeToQuote(fee)}
          />
        );
      })}
    </FeeSheetLayout>
  );
}
