import { RefObject, useState } from 'react';

import { useSettings } from '@/store/settings/settings.write';

import {
  Box,
  Button,
  IconProps,
  Sheet,
  SheetRef,
  UIBottomSheetTextInput,
} from '@leather.io/ui/native';

import { ModalHeader } from '../modal-headers/modal-header';
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
  onSubmit(newVal: string): unknown;
  onDismiss?(): unknown;
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
  const { theme: themeVariant } = useSettings();
  return (
    <Sheet onDismiss={onDismiss} ref={sheetRef} themeVariant={themeVariant}>
      <Box p="5" justifyContent="space-between" gap="5">
        <Box>
          <ModalHeader Icon={TitleIcon} modalVariant="normal" title={title} />
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
