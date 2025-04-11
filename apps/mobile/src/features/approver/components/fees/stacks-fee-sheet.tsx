import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { t } from '@lingui/macro';
import { deserializeTransaction } from '@stacks/transactions';

import { FeeTypes, Money } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

import { FeeSheetLayout } from './fee-sheet.layout';
import { StacksFeeOption } from './stacks-fee-option';

const feeTypes = [FeeTypes.Low, FeeTypes.Middle, FeeTypes.High, FeeTypes.Custom];

interface FeesSheetProps {
  sheetRef: RefObject<SheetRef>;
  selectedFeeType: FeeTypes;
  setSelectedFeeType(selcetedFeeType: FeeTypes): void;
  txHex: string;
  setTxHex(txHex: string): void;
  fees: Record<FeeTypes, Money>;
  currentFee: Money;
}

export function StacksFeesSheet({
  sheetRef,
  selectedFeeType,
  setSelectedFeeType,
  fees,
  currentFee,
  txHex,
  setTxHex,
}: FeesSheetProps) {
  const { data: stxMarketData } = useStxMarketDataQuery();
  const tx = deserializeTransaction(txHex);
  const { displayToast } = useToastContext();

  function onChangeFee(feeType: FeeTypes) {
    try {
      tx.setFee(fees[feeType].amount.toNumber());
      const newTxHex = tx.serialize();
      setTxHex(newTxHex);
      setSelectedFeeType(feeType);
      displayToast({
        title: t({
          id: 'approver.send.stx.success.change-fee',
          message: 'Fee updated',
        }),
        type: 'success',
      });
    } catch {
      displayToast({
        title: t({
          id: 'approver.send.stx.error.change-fee',
          message: 'Failed to change fee',
        }),
        type: 'error',
      });
    }
  }

  function convertFeeToFiat(fee: Money) {
    return baseCurrencyAmountInQuoteWithFallback(fee, stxMarketData);
  }

  function handleChangeFee(feeType: FeeTypes) {
    sheetRef.current?.close();
    onChangeFee(feeType);
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
