import { RefObject } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { KeyboardController } from 'react-native-keyboard-controller';
import { SharedValue } from 'react-native-reanimated';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { TextInput, Theme } from '@leather.io/ui/native';

interface SearchInputProps {
  textInputRef: RefObject<RNTextInput>;
  isUrlFocused: SharedValue<boolean>;
  textUrl: string;
  setTextUrl(textUrl: string): void;
  onSubmit(): void;
}

export function SearchInput({
  textInputRef,
  isUrlFocused,
  textUrl,
  setTextUrl,
  onSubmit,
}: SearchInputProps) {
  const theme = useTheme<Theme>();
  return (
    <TextInput
      ref={textInputRef}
      onFocus={() => {
        isUrlFocused.value = true;
      }}
      onBlur={() => {
        KeyboardController.dismiss();
        isUrlFocused.value = false;
      }}
      keyboardType="web-search"
      textContentType="URL"
      autoCapitalize="none"
      onChangeText={setTextUrl}
      value={textUrl}
      autoComplete="url"
      onSubmitEditing={onSubmit}
      width="100%"
      py="5"
      px="4"
      borderRadius="sm"
      borderColor="ink.border-default"
      borderWidth={1}
      placeholderTextColor={theme.colors['ink.text-subdued']}
      color="ink.text-primary"
      placeholder={t({
        id: 'browser.input_placeholder',
        message: 'Type URL or search',
      })}
    />
  );
}
