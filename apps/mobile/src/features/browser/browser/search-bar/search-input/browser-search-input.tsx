import { KeyboardController } from 'react-native-keyboard-controller';

import { BrowserSelectors } from '@/shared/selectors/browser.selectors';

import { Box, useTheme } from '@leather.io/ui/native';

import { GenericClearSearchButton } from './generic-clear-search-button';
import { GenericSearchTextInput } from './generic-search-text-input';
import { SearchInputProps } from './utils';

export function BrowserSearchInput({
  textInputRef,
  textUrl,
  setTextUrl,
  onSubmit,
}: SearchInputProps) {
  const theme = useTheme();
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
        testID={BrowserSelectors.SearchInput}
      />
      {textUrl && (
        <GenericClearSearchButton
          onPress={() => setTextUrl('')}
          right={-theme.spacing['4']}
          testID={BrowserSelectors.ClearSearchButton}
        />
      )}
    </Box>
  );
}
