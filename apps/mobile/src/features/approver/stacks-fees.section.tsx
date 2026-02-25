import { useRef, useState } from 'react';

import { useStacksTransactionFees } from '@/queries/stacks/fees/stacks-transaction-fees.hooks';
import { deserializeTransaction } from '@stacks/transactions';

import { FeeTypes } from '@leather.io/models';
import { Approver, SheetInstance } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { StacksFeeCard } from './components/fees/stacks-fee-card';
import { StacksFeesSheet } from './components/fees/stacks-fee-sheet';
import { getTxFeeMoney } from './utils';

interface StacksFeesSectionProps {
  txHex: string;
  onChangeFee(fee: number): void;
  disabled?: boolean;
}

export function StacksFeesSection({ txHex, onChangeFee, disabled }: StacksFeesSectionProps) {
  const tx = deserializeTransaction(txHex);
  const { data: stxFees } = useStacksTransactionFees(tx);
  const fee = tx.auth.spendingCondition.fee;
  function getFeeType() {
    if (!stxFees) return FeeTypes.Custom;
    const { low, standard, high } = stxFees.options;
    if (Number(fee) === standard.value.amount.toNumber()) {
      return FeeTypes.Middle;
    }
    if (Number(fee) === low.value.amount.toNumber()) {
      return FeeTypes.Low;
    }
    if (Number(fee) === high.value.amount.toNumber()) {
      return FeeTypes.High;
    }
    return FeeTypes.Custom;
  }

  const feeSheetRef = useRef<SheetInstance>(null);

  const [selectedFeeType, setSelectedFeeType] = useState<FeeTypes>(getFeeType());
  const zeroMoney = createMoney(0, 'STX');
  const fees = {
    [FeeTypes.Low]: stxFees?.options.low.value || zeroMoney,
    [FeeTypes.Middle]: stxFees?.options.standard.value || zeroMoney,
    [FeeTypes.High]: stxFees?.options.high.value || zeroMoney,
    [FeeTypes.Unknown]: zeroMoney,
    [FeeTypes.Custom]: zeroMoney,
  };
  const feeMoney = getTxFeeMoney(tx);
  return (
    <>
      <Approver.Section>
        <StacksFeeCard
          feeType={selectedFeeType}
          amount={feeMoney}
          onPress={() => {
            feeSheetRef.current?.present();
          }}
          disabled={disabled}
        />
      </Approver.Section>
      <StacksFeesSheet
        sheetRef={feeSheetRef}
        selectedFeeType={selectedFeeType}
        fees={fees}
        currentFee={createMoney(fee, 'STX')}
        onChangeFeeType={feeType => {
          setSelectedFeeType(feeType);
          onChangeFee(fees[feeType].amount.toNumber());
        }}
      />
    </>
  );
}
