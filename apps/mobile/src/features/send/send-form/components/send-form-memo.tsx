import { useRef } from 'react';

import { t } from '@lingui/macro';

import { NoteEmptyIcon, SheetRef, Text, TouchableOpacity } from '@leather.io/ui/native';

import { MemoSheet } from '../sheets/memo-sheet';

export function SendFormMemo() {
  const memoSheetRef = useRef<SheetRef>(null);
  return (
    <>
      <TouchableOpacity
        gap="1"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        onPress={() => memoSheetRef.current?.present()}
        p="2"
      >
        <NoteEmptyIcon />
        <Text variant="label02">
          {t({
            id: 'send_form.memo.input.label',
            message: 'Add memo',
          })}
        </Text>
      </TouchableOpacity>
      <MemoSheet sheetRef={memoSheetRef} />
    </>
  );
}
