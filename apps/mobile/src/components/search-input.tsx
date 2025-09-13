import { type NativeSyntheticEvent, type TextInputSubmitEditingEventData } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { TextInput } from '@/components/text-input';
import { t } from '@lingui/core/macro';

import {
  Box,
  CloseIcon,
  IconButton,
  SearchIcon,
  TextInput as UITextInput,
} from '@leather.io/ui/native';

interface SearchInputProps {
  value: string;
  onChange(value: string): void;
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  placeholder: string;
  autoFocus?: boolean;
  TextInputComponent?: typeof UITextInput;
}

export function SearchInput({
  value,
  onChange,
  onSubmitEditing,
  placeholder,
  autoFocus,
  TextInputComponent = UITextInput,
}: SearchInputProps) {
  function clearValue() {
    onChange('');
  }

  return (
    <Box flexDirection="row" alignItems="center">
      <Box position="absolute" left={12}>
        <SearchIcon color="ink.text-subdued" />
      </Box>
      <Box flexGrow={1}>
        <TextInput
          accessibilityRole="search"
          px="7"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          inputState="default"
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          TextInputComponent={TextInputComponent}
          textVariant="label02"
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
        />
      </Box>
      {value.length > 0 && (
        <Animated.View
          style={{ position: 'absolute', right: 8 }}
          collapsable
          entering={FadeIn.delay(250).duration(100)}
          exiting={FadeOut.duration(100)}
        >
          <IconButton
            label={t`Clear search`}
            hitSlop={8}
            onPress={clearValue}
            icon={<CloseIcon variant="small" color="ink.text-subdued" />}
          />
        </Animated.View>
      )}
    </Box>
  );
}
