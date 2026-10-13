import { useState } from 'react';

import { Box, Button, Sheet, SheetRef, Text } from '@leather.io/ui/native';

import { TextInput } from '../text-input';

interface InputSheetLayoutProps {
  sheetRef: SheetRef;
  initialValue: string;
  title: string;
  description?: string;
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
  description,
  submitTitle,
  onSubmit,
  onDismiss,
  inputTestId,
  submitTestId,
}: InputSheetLayoutProps) {
  const [internalValue, setInternalValue] = useState(initialValue);

  return (
    <Sheet onDismiss={onDismiss} ref={sheetRef}>
      <Sheet.View>
        <Sheet.Header leftElement={<Sheet.Title>{title}</Sheet.Title>} />
        <Box mt="3" px="5" gap="5">
          {description && <Text>{description}</Text>}
          <TextInput
            value={internalValue}
            onChangeText={text => setInternalValue(text)}
            placeholder={placeholder}
            inputState="focused"
            autoCorrect={false}
            autoComplete="off"
            autoFocus
            autoCapitalize="none"
            TextInputComponent={Sheet.TextInput}
            testID={inputTestId}
          />
          <Button onPress={() => onSubmit(internalValue)} testID={submitTestId}>
            {submitTitle}
          </Button>
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
