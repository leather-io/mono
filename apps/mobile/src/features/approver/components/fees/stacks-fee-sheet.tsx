import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { t } from '@lingui/macro';
import { StacksNetwork } from '@stacks/network';
import { PayloadType, deserializeTransaction } from '@stacks/transactions';

import { FeeTypes, Money } from '@leather.io/models';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { SheetRef } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney } from '@leather.io/utils';

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
  txOptions: {
    publicKey: string;
    network: StacksNetwork;
  };
}

export function StacksFeesSheet({
  sheetRef,
  selectedFeeType,
  setSelectedFeeType,
  fees,
  currentFee,
  txHex,
  setTxHex,
  txOptions,
}: FeesSheetProps) {
  const { data: stxMarketData } = useStxMarketDataQuery();
  const tx = deserializeTransaction(txHex);
  const { displayToast } = useToastContext();

  async function onChangeFee(feeType: FeeTypes) {
    try {
      if (tx.payload.payloadType === PayloadType.TokenTransfer) {
        const newTx = await generateStacksUnsignedTransaction({
          txType: TransactionTypes.StxTokenTransfer,
          amount: createMoney(tx.payload.amount, 'STX'),
          fee: fees[feeType],
          memo: tx.payload.memo.content,
          nonce: Number(tx.auth.spendingCondition.nonce),
          recipient: tx.payload.recipient,
          ...txOptions,
        });
        const newTxHex = newTx.serialize();
        setTxHex(newTxHex);
        setSelectedFeeType(feeType);
        displayToast({
          title: t({
            id: 'approver.send.stx.success.change-fee',
            message: 'Fee updated',
          }),
          type: 'success',
        });
      }
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
    void onChangeFee(feeType);
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
