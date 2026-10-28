import { useRef, useState } from 'react';

import { useStacksTransactionFees } from '@/queries/stacks/fees/stacks-transaction-fees.query';
import { AuthType, deserializeTransaction } from '@stacks/transactions';

import { type FeeTypes } from '@leather.io/models';
import { Approver, type SheetInstance } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { SponsoredFeeCard } from './components/fees/sponsored-fee-card';
import { StacksFeeCard } from './components/fees/stacks-fee-card';
import { StacksFeesSheet } from './components/fees/stacks-fee-sheet';
import { getStacksFeeType, getStacksFeesByType } from './stacks-fees.utils';
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

  const feeSheetRef = useRef<SheetInstance>(null);

  const [chosenFeeType, setChosenFeeType] = useState<FeeTypes | null>(null);
  const feeMoney = getTxFeeMoney(tx);
  const selectedFeeType = chosenFeeType ?? getStacksFeeType(feeMoney, stxFees);
  const fees = getStacksFeesByType(stxFees);

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
          disabled={disabled}
        />
      </Approver.Section>
      <StacksFeesSheet
        sheetRef={feeSheetRef}
        selectedFeeType={selectedFeeType}
        fees={fees}
        currentFee={createMoney(fee, 'STX')}
        onChangeFeeType={feeType => {
          setChosenFeeType(feeType);
          onChangeFee(fees[feeType].amount.toNumber());
        }}
      />
    </>
  );
}
