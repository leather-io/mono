import { RefObject, useState } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { t } from '@lingui/macro';

import { Button, SheetRef, UIBottomSheetTextInput } from '@leather.io/ui/native';

interface NonceSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  nonce: string;
  onChangeNonce(nonce: string): void;
}
export function NonceSheet({ sheetRef, nonce: _nonce, onChangeNonce }: NonceSheetProps) {
  const [nonce, setNonce] = useState(_nonce);

  return (
    <SheetLayout
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
