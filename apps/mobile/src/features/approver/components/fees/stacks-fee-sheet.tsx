import { RefObject } from 'react';

import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';

import { FeeTypes, Money } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

import { FeeSheetLayout } from './fee-sheet.layout';
import { StacksFeeOption } from './stacks-fee-option';

const feeTypes = [FeeTypes.Low, FeeTypes.Middle, FeeTypes.High, FeeTypes.Custom];

interface FeesSheetProps {
  sheetRef: RefObject<SheetRef>;
  selectedFeeType: FeeTypes;
  fees: Record<FeeTypes, Money>;
  currentFee: Money;
  onChangeFeeType(feeType: FeeTypes): void;
}

export function StacksFeesSheet({
  sheetRef,
  selectedFeeType,
  fees,
  currentFee,
  onChangeFeeType,
}: FeesSheetProps) {
  const { data: stxMarketData } = useStxMarketDataQuery();

  function convertFeeToFiat(fee: Money) {
    return baseCurrencyAmountInQuoteWithFallback(fee, stxMarketData);
  }

  function handleChangeFee(feeType: FeeTypes) {
    sheetRef.current?.close();
    onChangeFeeType(feeType);
  }

  return (
    <FeeSheetLayout sheetRef={sheetRef}>
      {feeTypes.map(feeType => {
        const fee = feeType !== FeeTypes.Custom ? fees[feeType] : currentFee;
        return (
          <StacksFeeOption
            isSelected={selectedFeeType === feeType}
            disabled={feeType === FeeTypes.Custom}
            onPress={() => handleChangeFee(feeType)}
            key={feeType}
            feeType={feeType}
            fee={fee}
            fiatFee={convertFeeToFiat(fee)}
          />
        );
      })}
    </FeeSheetLayout>
  );
}
