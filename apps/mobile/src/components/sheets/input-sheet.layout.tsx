import { RefObject, useState } from 'react';

import { useSettings } from '@/store/settings/settings';

import {
  Box,
  Button,
  IconProps,
  Sheet,
  SheetHeader,
  SheetRef,
  UIBottomSheetTextInput,
} from '@leather.io/ui/native';

import { TextInput } from '../text-input';

export interface OptionData {
  title: string;
  id: string;
}

interface InputSheetProps {
  sheetRef: RefObject<SheetRef>;
  initialValue: string;
  title: string;
  TitleIcon: React.FC<IconProps>;
  placeholder: string;
  submitTitle: string;
  onSubmit(newVal: string): void;
  onDismiss?(): void;
}
export function InputSheet({
  sheetRef,
  initialValue,
  placeholder,
  title,
  TitleIcon,
  submitTitle,
  onSubmit,
  onDismiss,
}: InputSheetProps) {
  const [internalValue, setInternalValue] = useState(initialValue);
  const { themeDerivedFromThemePreference } = useSettings();
  return (
    <Sheet onDismiss={onDismiss} ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box p="5" justifyContent="space-between" gap="5">
        <Box>
          <SheetHeader
            icon={
              <Box bg="ink.background-secondary" borderRadius="round" flexDirection="row" p="2">
                <TitleIcon color="ink.text-primary" />
              </Box>
            }
            title={title}
          />
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
          />
        </Box>
        <Button onPress={() => onSubmit(internalValue)} buttonState="default" title={submitTitle} />
      </Box>
    </Sheet>
  );
}
