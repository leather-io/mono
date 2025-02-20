import { useRef, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { t } from '@lingui/macro';

import {
  Button,
  NoteEmptyIcon,
  NoteTextIcon,
  Pressable,
  type SheetRef,
  Text,
  UIBottomSheetTextInput,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

interface MemoProps {
  value?: string;
  onChange(value: string): void;
  onBlur(): void;
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error: FieldError | undefined;
}

export function Memo({ value, onChange, onBlur, invalid, isTouched, error }: MemoProps) {
  const sheetRef = useRef<SheetRef>(null);
  const [confirmationAttempted, setConfirmationAttempted] = useState(false);
  const shouldDisplayErrorMessage = error && confirmationAttempted;
  const shouldMarkToggleAsInvalid = invalid && isTouched && confirmationAttempted;
  const toggleLabel = value
    ? t({
        id: 'send_form.memo.input.label.filled',
        message: 'Edit memo',
      })
    : t({
        id: 'send_form.memo.input.label.empty',
        message: 'Add memo',
      });

  function handleSubmitEditing(event?: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
    setConfirmationAttempted(true);
    event?.preventDefault();
    if (invalid) {
      return;
    }
    sheetRef.current?.dismiss();
  }

  function handleSheetStateChange() {
    onBlur();
  }

  return (
    <>
      <Pressable
        gap="1"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        alignSelf="center"
        borderRadius="sm"
        onPress={() => sheetRef.current?.present()}
        p="2"
        pressEffects={legacyTouchablePressEffect}
      >
        <NoteEmptyIcon
          color={shouldMarkToggleAsInvalid ? 'red.action-primary-default' : 'ink.text-primary'}
        />
        <Text variant="label02">{toggleLabel}</Text>
      </Pressable>

      <SheetLayout
        icon={<NoteTextIcon />}
        sheetRef={sheetRef}
        onChange={handleSheetStateChange}
        title={t({
          id: 'add_memo.header_title',
          message: 'Add memo',
        })}
      >
        <TextInput
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          autoFocus
          inputState="focused"
          onChangeText={onChange}
          placeholder={t({
            id: 'add_memo.input_placeholder',
            message: 'Memo',
          })}
          TextInputComponent={UIBottomSheetTextInput}
          value={value}
          textVariant="caption01"
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={handleSubmitEditing}
        />
        {shouldDisplayErrorMessage ? (
          <Text variant="label02" color="red.action-primary-default" mt="-1">
            {error.message}
          </Text>
        ) : null}
        <Button
          mt="3"
          buttonState="default"
          onPress={() => handleSubmitEditing()}
          title={t({
            id: 'add_memo.confirm_button',
            message: 'Confirm',
          })}
        />
      </SheetLayout>
    </>
  );
}
