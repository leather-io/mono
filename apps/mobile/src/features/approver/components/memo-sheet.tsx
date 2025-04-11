import { RefObject, useState } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import { deserializeTransaction } from '@stacks/transactions';

import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { Button, NoteTextIcon, SheetRef, UIBottomSheetTextInput } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { TxOptions, assertTokenTransferPayload } from '../utils';

interface MemoSheetProps {
  sheetRef: RefObject<SheetRef>;
  memo: string;
  txHex: string;
  setTxHex(txHex: string): void;
  txOptions: TxOptions;
}
export function MemoSheet({ sheetRef, memo: _memo, txHex, setTxHex, txOptions }: MemoSheetProps) {
  const [memo, setMemo] = useState(_memo);
  const tx = deserializeTransaction(txHex);
  const { displayToast } = useToastContext();

  async function onChangeMemo(memo: string) {
    assertTokenTransferPayload(tx.payload);
    try {
      const newTx = await generateStacksUnsignedTransaction({
        txType: TransactionTypes.StxTokenTransfer,
        amount: createMoney(tx.payload.amount, 'STX'),
        fee: createMoney(tx.auth.spendingCondition.fee, 'STX'),
        nonce: Number(tx.auth.spendingCondition.nonce),
        recipient: tx.payload.recipient,
        memo,
        ...txOptions,
      });
      const newTxHex = newTx.serialize();
      setTxHex(newTxHex);
    } catch {
      displayToast({
        title: t({
          id: 'approver.send.stx.error.change-memo',
          message: 'Failed to change memo',
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
        id: 'approver.add_memo.header_title',
        message: 'Add memo',
      })}
    >
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        autoFocus
        inputState="focused"
        onChangeText={setMemo}
        placeholder={t({
          id: 'approver.add_memo.input_placeholder',
          message: 'Memo',
        })}
        TextInputComponent={UIBottomSheetTextInput}
        value={memo}
      />
      <Button
        mt="3"
        buttonState="default"
        onPress={() => {
          sheetRef.current?.close();
          void onChangeMemo(memo);
        }}
        title={t({
          id: 'approver.add_memo.confirm_button',
          message: 'Confirm',
        })}
      />
    </SheetLayout>
  );
}
