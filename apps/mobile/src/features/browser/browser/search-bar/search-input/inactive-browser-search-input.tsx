import { KeyboardController } from 'react-native-keyboard-controller';

import { Box } from '@leather.io/ui/native';

import { GenericClearSearchButton } from './generic-clear-search-button';
import { GenericSearchTextInput } from './generic-search-text-input';
import { SearchInputProps } from './utils';

export function InactiveBrowserSearchInput({
  textInputRef,
  isUrlFocused,
  textUrl,
  setTextUrl,
  onSubmit,
}: SearchInputProps) {
  return (
    <Box>
      <GenericSearchTextInput
        ref={textInputRef}
        onFocus={() => {
          isUrlFocused.value = true;
        }}
        onBlur={async () => {
          await KeyboardController.dismiss();
          isUrlFocused.value = false;
        }}
        onChangeText={setTextUrl}
        value={textUrl}
        onSubmitEditing={onSubmit}
      />
      {textUrl && <GenericClearSearchButton onPress={() => setTextUrl('')} right={2} />}
    </Box>
  );
}
