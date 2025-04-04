import { RefObject, useState } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import { PayloadType, deserializeTransaction } from '@stacks/transactions';

import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { Button, NoteTextIcon, SheetRef, UIBottomSheetTextInput } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { TxOptions } from '../utils';

interface NonceSheetProps {
  sheetRef: RefObject<SheetRef>;
  nonce: string;
  txHex: string;
  setTxHex(txHex: string): void;

  txOptions: TxOptions;
}
export function NonceSheet({
  sheetRef,
  nonce: _nonce,
  txHex,
  setTxHex,
  txOptions,
}: NonceSheetProps) {
  const [nonce, setNonce] = useState(_nonce);
  const tx = deserializeTransaction(txHex);
  const { displayToast } = useToastContext();

  async function onChangeNonce(nonce: string) {
    try {
      if (tx.payload.payloadType === PayloadType.TokenTransfer) {
        const newTx = await generateStacksUnsignedTransaction({
          txType: TransactionTypes.StxTokenTransfer,
          amount: createMoney(tx.payload.amount, 'STX'),
          fee: createMoney(tx.auth.spendingCondition.fee, 'STX'),
          memo: tx.payload.memo.content,
          nonce: Number(nonce),
          recipient: tx.payload.recipient,
          ...txOptions,
        });
        const newTxHex = newTx.serialize();
        setTxHex(newTxHex);
      }
    } catch {
      displayToast({
        title: t({
          id: 'approver.send.stx.error.change-nonce',
          message: 'Failed to change nonce',
        }),
        type: 'error',
      });
    }
  }

  return (
    <SheetLayout
      icon={<NoteTextIcon />}
      sheetRef={sheetRef}
      title={t({
        id: 'approver.add_nonce.header_title',
        message: 'Add nonce',
      })}
    >
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        autoFocus
        inputState="focused"
        onChangeText={setNonce}
        placeholder={t({
          id: 'approver.add_nonce.input_placeholder',
          message: 'Nonce',
        })}
        TextInputComponent={UIBottomSheetTextInput}
        value={nonce}
      />
      <Button
        mt="3"
        buttonState="default"
        onPress={() => {
          sheetRef.current?.close();
          void onChangeNonce(nonce);
        }}
        title={t({
          id: 'approver.add_nonce.confirm_button',
          message: 'Confirm',
        })}
      />
    </SheetLayout>
  );
}
