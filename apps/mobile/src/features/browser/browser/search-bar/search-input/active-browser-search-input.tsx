import { useState } from 'react';
import { KeyboardController } from 'react-native-keyboard-controller';

import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

import { GenericClearSearchButton } from './generic-clear-search-button';
import { GenericSearchTextInput } from './generic-search-text-input';
import { SearchInputProps } from './utils';

export function ActiveBrowserSearchInput({
  textInputRef,
  isUrlFocused: isFocused,
  textUrl,
  setTextUrl,
  onSubmit,
}: SearchInputProps) {
  const theme = useTheme<Theme>();
  // changing this to fix eslint error about prop mutation but it seems like isUrlFocused is always false
  const [isUrlFocused, setIsUrlFocused] = useState(isFocused.value);
  return (
    <Box>
      <GenericSearchTextInput
        ref={textInputRef}
        onFocus={() => {
          setIsUrlFocused(!isUrlFocused);
        }}
        onBlur={async () => {
          await KeyboardController.dismiss();
          setIsUrlFocused(!isUrlFocused);
        }}
        onChangeText={setTextUrl}
        value={textUrl}
        onSubmitEditing={onSubmit}
      />
      {textUrl && (
        <GenericClearSearchButton onPress={() => setTextUrl('')} right={-theme.spacing['4']} />
      )}
    </Box>
  );
}
