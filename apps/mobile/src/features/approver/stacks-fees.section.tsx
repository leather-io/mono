import { useRef, useState } from 'react';

import { useCalculateStacksTxFees } from '@/queries/stacks/fees/fees.hooks';
import { AuthType, deserializeTransaction } from '@stacks/transactions';

import { FeeTypes } from '@leather.io/models';
import { Approver, type SheetInstance } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { SponsoredFeeCard } from './components/fees/sponsored-fee-card';
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
  const { data: stxFees } = useCalculateStacksTxFees(tx);
  const fee = tx.auth.spendingCondition.fee;
  function getFeeType() {
    const options = stxFees?.options;
    if (Number(fee) === options?.standard.value.amount.toNumber()) {
      return FeeTypes.Middle;
    }
    if (Number(fee) === options?.low.value.amount.toNumber()) {
      return FeeTypes.Low;
    }
    if (Number(fee) === options?.high.value.amount.toNumber()) {
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

  if (tx.auth.authType === AuthType.Sponsored) {
    return (
      <Approver.Section>
        <SponsoredFeeCard />
      </Approver.Section>
    );
  }

  return (
    <>
      <Approver.Section>
        <StacksFeeCard
          feeType={selectedFeeType}
          amount={feeMoney}
          onPress={() => {
            feeSheetRef.current?.present();
          }}
          disabled={disabled || !stxFees}
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
