import { useRef, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { t } from '@lingui/macro';

import {
  AddressDisplayer,
  Avatar,
  Box,
  Button,
  Flag,
  Pressable,
  SheetRef,
  Text,
  UIBottomSheetTextInput,
  UserIcon,
} from '@leather.io/ui/native';

interface RecipientProps {
  value: string;
  onChange(value: string): void;
  onBlur(): void;
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error: FieldError | undefined;
}

export function Recipient({ value, onChange, onBlur, invalid, isTouched, error }: RecipientProps) {
  const sheetRef = useRef<SheetRef>(null);
  const [confirmationAttempted, setConfirmationAttempted] = useState(false);

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
      <RecipientToggle
        value={value}
        onPress={() => sheetRef.current?.present()}
        invalid={invalid && isTouched && confirmationAttempted}
      />

      <SheetLayout
        sheetRef={sheetRef}
        icon={<UserIcon />}
        onChange={handleSheetStateChange}
        title={t({
          id: 'send.enter_recipient.header_title',
          message: 'Enter recipient',
        })}
      >
        <TextInput
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          autoFocus
          inputState="focused"
          value={value}
          onChangeText={onChange}
          placeholder={t({
            id: 'recipient-sheet.recipient.input.placeholder',
            message: 'Enter recipient',
          })}
          TextInputComponent={UIBottomSheetTextInput}
          textVariant="caption01"
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={handleSubmitEditing}
        />
        {error && confirmationAttempted ? (
          <Text variant="label02" color="red.action-primary-default" mt="-1">
            {error.message}
          </Text>
        ) : null}
        <Button
          mt="2"
          buttonState="default"
          onPress={() => handleSubmitEditing()}
          title={t({
            id: 'approver.add_memo.confirm_button',
            message: 'Confirm',
          })}
        />
      </SheetLayout>
    </>
  );
}

interface RecipientToggleProps {
  onPress(): void;
  value: string;
  invalid: boolean;
}

function RecipientToggle({ onPress, value, invalid }: RecipientToggleProps) {
  return (
    <Pressable
      onPress={onPress}
      pressEffects={{
        backgroundColor: {
          from: 'ink.background-primary',
          to: 'ink.background-secondary',
        },
      }}
    >
      <Box
        borderColor={invalid ? 'red.border' : 'ink.border-default'}
        borderRadius="sm"
        borderWidth={1}
        height={64}
        overflow="hidden"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        py="4"
        pl="4"
        pr="2"
      >
        {value ? (
          <Flag img={<Avatar icon={<UserIcon />} />}>
            <AddressDisplayer address={value.toUpperCase()} />
          </Flag>
        ) : (
          <Text variant="label02" color="ink.text-subdued">
            {t({
              id: 'send_form.recipient.input.label',
              message: 'Enter recipient',
            })}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}
