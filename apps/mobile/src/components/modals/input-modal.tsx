import { RefObject, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { Box, IconProps } from '@leather.io/ui/native';

import { CLOSED_ANIMATED_SHARED_VALUE, Modal, UIBottomSheetTextInput } from '../bottom-sheet-modal';
import { Button } from '../button';
import { ModalHeader } from '../modal-headers/modal-header';
import { TextInput } from '../text-input';

export interface OptionData {
  title: string;
  id: string;
}

interface InputModalProps {
  modalRef: RefObject<BottomSheetModal>;
  initialValue: string;
  title: string;
  TitleIcon: React.FC<IconProps>;
  placeholder: string;
  submitTitle: string;
  onSubmit(newVal: string): unknown;
  onDismiss?(): unknown;
}

export function InputModal({
  modalRef,
  initialValue,
  placeholder,
  title,
  TitleIcon,
  submitTitle,
  onSubmit,
  onDismiss,
}: InputModalProps) {
  const animatedPosition = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);
  const [internalValue, setInternalValue] = useState(initialValue);
  return (
    <Modal onDismiss={onDismiss} animatedPosition={animatedPosition} ref={modalRef}>
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
    </Modal>
  );
}
