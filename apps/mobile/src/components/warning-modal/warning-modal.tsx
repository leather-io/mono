import { RefObject } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { Box, Button, ButtonState, ErrorTriangleIcon, Text } from '@leather.io/ui/native';

import { Modal } from '../bottom-sheet-modal';
import { ModalHeader } from '../modal-headers/modal-header';
import { WarningModalVariant } from './types';

function getSubmitButtonState(variant: WarningModalVariant): ButtonState {
  switch (variant) {
    case 'normal':
      return 'default';
    case 'critical':
      return 'critical';
  }
}

interface WarningModalProps {
  modalRef: RefObject<BottomSheetModal>;
  variant: WarningModalVariant;
  title: string;
  description: string;
  submitButton: {
    onPress(): unknown;
    title: string;
  };
  skipButton: {
    onPress?(): unknown;
    title: string;
  };
  onPressSupport?(): unknown;
}

export function WarningModal({
  modalRef,
  variant,
  title,
  description,
  submitButton,
  skipButton,
  onPressSupport,
}: WarningModalProps) {
  return (
    <Modal ref={modalRef}>
      <Box p="5" justifyContent="space-between" gap="5">
        <Box gap="5">
          <Box>
            <ModalHeader
              title={title}
              modalVariant={variant}
              Icon={ErrorTriangleIcon}
              onPressSupport={onPressSupport}
            />
          </Box>
          <Text>{description}</Text>
        </Box>
        <Box gap="3">
          <Button
            onPress={submitButton.onPress}
            buttonState={getSubmitButtonState(variant)}
            title={submitButton.title}
          />
          <Button
            onPress={() => {
              skipButton.onPress?.();
              modalRef.current?.dismiss();
            }}
            buttonState="ghost"
            title={skipButton.title}
          />
        </Box>
      </Box>
    </Modal>
  );
}
