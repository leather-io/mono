import { KeyboardController } from 'react-native-keyboard-controller';

import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

import { GenericClearSearchButton } from './generic-clear-search-button';
import { GenericSearchTextInput } from './generic-search-text-input';
import { SearchInputProps } from './utils';

export function BrowserSearchInput({
  textInputRef,
  textUrl,
  setTextUrl,
  onSubmit,
}: SearchInputProps) {
  const theme = useTheme<Theme>();
  return (
    <Box>
      <GenericSearchTextInput
        ref={textInputRef}
        onBlur={async () => {
          await KeyboardController.dismiss();
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
