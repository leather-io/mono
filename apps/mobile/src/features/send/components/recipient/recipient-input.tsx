import { type NativeSyntheticEvent, type TextInputSubmitEditingEventData } from 'react-native';

import { TextInput } from '@/components/text-input';
import { t } from '@lingui/macro';

import {
  Box,
  CloseIcon,
  Pressable,
  SearchIcon,
  UIBottomSheetTextInput,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

interface RecipientInputProps {
  value: string;
  onChange(value: string): void;
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  autoFocus?: boolean;
}

export function RecipientInput({
  value,
  onChange,
  onSubmitEditing,
  autoFocus,
}: RecipientInputProps) {
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
          inputState="focused"
          value={value}
          onChangeText={onChange}
          placeholder={t({
            id: 'send-form.recipient.input.placeholder',
            message: 'Search for BNS name or address',
          })}
          TextInputComponent={UIBottomSheetTextInput}
          textVariant="label02"
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
        />
      </Box>
      {value.length > 0 && (
        <Pressable
          pressEffects={legacyTouchablePressEffect}
          position="absolute"
          right={16}
          hitSlop={24}
          onPress={clearValue}
        >
          <CloseIcon variant="small" />
        </Pressable>
      )}
    </Box>
  );
}
