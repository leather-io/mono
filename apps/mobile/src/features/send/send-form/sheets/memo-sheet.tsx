import { RefObject } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import { z } from 'zod';

import { Button, NoteTextIcon, SheetRef, UIBottomSheetTextInput } from '@leather.io/ui/native';

import { SendFormBaseContext, useSendFormContext } from '../send-form-context';

interface MemoSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function MemoSheet<T extends SendFormBaseContext<T>>({ sheetRef }: MemoSheetProps) {
  const { formData } = useSendFormContext<T>();
  const { control } = useFormContext<z.infer<typeof formData.schema>>();
  const { displayToast } = useToastContext();

  function onAddMemo() {
    // Check errors here before toast?
    // Are there any rules for memo?
    sheetRef.current?.close();
    displayToast({
      title: t({
        id: 'add_memo.toast_title_success',
        message: 'Memo updated',
      }),
      type: 'success',
    });
  }

  return (
    <SheetLayout
      icon={<NoteTextIcon />}
      sheetRef={sheetRef}
      title={t({
        id: 'add_memo.header_title',
        message: 'Add memo',
      })}
    >
      <Controller
        control={control}
        name="memo"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            autoFocus
            inputState="focused"
            onBlur={onBlur}
            onChangeText={value => onChange(value)}
            placeholder={t({
              id: 'add_memo.input_placeholder',
              message: 'Memo',
            })}
            TextInputComponent={UIBottomSheetTextInput}
            value={value}
          />
        )}
      />
      <Button
        mt="3"
        buttonState="default"
        onPress={() => onAddMemo()}
        title={t({
          id: 'add_memo.confirm_button',
          message: 'Confirm',
        })}
      />
    </SheetLayout>
  );
}
