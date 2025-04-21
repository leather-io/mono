import { useRef, useState } from 'react';

import { useCalculateStacksTxFees } from '@/queries/stacks/fees/fees.hooks';
import { deserializeTransaction } from '@stacks/transactions';

import { FeeTypes } from '@leather.io/models';
import { Approver, Box, SheetRef } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { StacksFeeCard } from './components/fees/stacks-fee-card';
import { StacksFeesSheet } from './components/fees/stacks-fee-sheet';
import { getTxFeeMoney } from './utils';

interface StacksFeesSectionProps {
  txHex: string;
  onChangeFee(fee: number): void;
}

export function StacksFeesSection({ txHex, onChangeFee }: StacksFeesSectionProps) {
  const tx = deserializeTransaction(txHex);
  const { data: stxFees } = useCalculateStacksTxFees(tx);
  const fee = tx.auth.spendingCondition.fee;
  function getFeeType() {
    const estimates = stxFees?.estimates;
    if (Number(fee) === estimates?.[1]?.fee.amount.toNumber()) {
      return FeeTypes.Middle;
    }
    if (Number(fee) === estimates?.[0]?.fee.amount.toNumber()) {
      return FeeTypes.Low;
    }
    if (Number(fee) === estimates?.[2]?.fee.amount.toNumber()) {
      return FeeTypes.High;
    }
    return FeeTypes.Custom;
  }

  const feeSheetRef = useRef<SheetRef>(null);

  const [selectedFeeType, setSelectedFeeType] = useState<FeeTypes>(getFeeType());
  const zeroMoney = createMoney(0, 'STX');
  const fees = {
    [FeeTypes.Low]: stxFees?.estimates[0]?.fee || zeroMoney,
    [FeeTypes.Middle]: stxFees?.estimates[1]?.fee || zeroMoney,
    [FeeTypes.High]: stxFees?.estimates[2]?.fee || zeroMoney,
    [FeeTypes.Unknown]: zeroMoney,
    [FeeTypes.Custom]: zeroMoney,
  };
  const feeMoney = getTxFeeMoney(tx);
  return (
    <>
      <Approver.Section>
        <Box />
        <StacksFeeCard
          feeType={selectedFeeType}
          amount={feeMoney}
          onPress={() => {
            feeSheetRef.current?.present();
          }}
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
