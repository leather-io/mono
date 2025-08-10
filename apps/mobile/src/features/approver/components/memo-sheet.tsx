import { RefObject, useState } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { t } from '@lingui/core/macro';

import { Button, SheetRef, UIBottomSheetTextInput } from '@leather.io/ui/native';

interface MemoSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  memo: string;
  onChangeMemo(memo: string): void;
}
export function MemoSheet({ sheetRef, memo: _memo, onChangeMemo }: MemoSheetProps) {
  const [memo, setMemo] = useState(_memo);

  return (
    <SheetLayout sheetRef={sheetRef} title={t`Add memo`}>
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        autoFocus
        inputState="focused"
        onChangeText={setMemo}
        placeholder={t`Memo`}
        TextInputComponent={UIBottomSheetTextInput}
        value={memo}
      />
      <Button
        mt="3"
        onPress={() => {
          sheetRef.current?.close();
          onChangeMemo(memo);
        }}
      >
        {t`Confirm`}
      </Button>
    </SheetLayout>
  );
}
