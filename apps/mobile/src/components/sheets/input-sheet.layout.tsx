import { RefObject, useState } from 'react';

import { useSettings } from '@/store/settings/settings';

import {
  Avatar,
  Box,
  Button,
  Sheet,
  SheetHeader,
  SheetRef,
  UIBottomSheetTextInput,
} from '@leather.io/ui/native';

import { TextInput } from '../text-input';

interface InputSheetLayoutProps {
  sheetRef: RefObject<SheetRef>;
  initialValue: string;
  title: string;
  icon: React.ReactNode;
  placeholder: string;
  submitTitle: string;
  onSubmit(newVal: string): void;
  onDismiss?(): void;
  inputTestId?: string;
  submitTestId?: string;
}
export function InputSheetLayout({
  sheetRef,
  initialValue,
  placeholder,
  title,
  icon,
  submitTitle,
  onSubmit,
  onDismiss,
  inputTestId,
  submitTestId,
}: InputSheetLayoutProps) {
  const [internalValue, setInternalValue] = useState(initialValue);
  const { themeDerivedFromThemePreference } = useSettings();
  return (
    <Sheet onDismiss={onDismiss} ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box p="5" justifyContent="space-between" gap="5">
        <Box>
          <SheetHeader icon={<Avatar>{icon}</Avatar>} title={title} />
          <TextInput
            value={internalValue}
            onChangeText={text => {
              setInternalValue(text);
            }}
            placeholder={placeholder}
            mt="4"
            inputState="focused"
            autoCorrect={false}
            autoComplete="off"
            autoFocus
            autoCapitalize="none"
            TextInputComponent={UIBottomSheetTextInput}
            testID={inputTestId}
          />
        </Box>
        <Button
          onPress={() => onSubmit(internalValue)}
          buttonState="default"
          title={submitTitle}
          testID={submitTestId}
        />
      </Box>
    </Sheet>
  );
}
