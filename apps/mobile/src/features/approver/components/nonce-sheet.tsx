import { RefObject, useState } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import { deserializeTransaction } from '@stacks/transactions';

import { Button, NoteTextIcon, SheetRef, UIBottomSheetTextInput } from '@leather.io/ui/native';

interface NonceSheetProps {
  sheetRef: RefObject<SheetRef>;
  nonce: string;
  txHex: string;
  setTxHex(txHex: string): void;
}
export function NonceSheet({ sheetRef, nonce: _nonce, txHex, setTxHex }: NonceSheetProps) {
  const [nonce, setNonce] = useState(_nonce);
  const tx = deserializeTransaction(txHex);
  const { displayToast } = useToastContext();

  function onChangeNonce(nonce: string) {
    try {
      tx.setNonce(Number(nonce));
      const newTxHex = tx.serialize();
      setTxHex(newTxHex);
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
          onChangeNonce(nonce);
        }}
        title={t({
          id: 'approver.add_nonce.confirm_button',
          message: 'Confirm',
        })}
      />
    </SheetLayout>
  );
}
