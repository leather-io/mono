import { KeyboardController } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { bottom } = useSafeAreaInsets();
  return (
    <Box style={{ marginBottom: bottom }}>
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
