import { RefObject, useState } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { t } from '@lingui/macro';

import { Button, NoteTextIcon, SheetRef, UIBottomSheetTextInput } from '@leather.io/ui/native';

interface MemoSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  memo: string;
  onChangeMemo(memo: string): void;
}
export function MemoSheet({ sheetRef, memo: _memo, onChangeMemo }: MemoSheetProps) {
  const [memo, setMemo] = useState(_memo);

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
          onChangeMemo(memo);
        }}
        title={t({
          id: 'approver.add_memo.confirm_button',
          message: 'Confirm',
        })}
      />
    </SheetLayout>
  );
}
