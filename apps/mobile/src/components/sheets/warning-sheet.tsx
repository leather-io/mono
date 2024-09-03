import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings.write';

import {
  Box,
  Button,
  ButtonState,
  ErrorTriangleIcon,
  Sheet,
  SheetRef,
  Text,
} from '@leather.io/ui/native';

import { ModalHeader } from '../modal-headers/modal-header';
import { WarningSheetVariant } from './types';

function getSubmitButtonState(variant: WarningSheetVariant): ButtonState {
  switch (variant) {
    case 'normal':
      return 'default';
    case 'critical':
      return 'critical';
  }
}

interface WarningSheetProps {
  sheetRef: RefObject<SheetRef>;
  variant: WarningSheetVariant;
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

export function WarningSheet({
  sheetRef,
  variant,
  title,
  description,
  submitButton,
  skipButton,
  onPressSupport,
}: WarningSheetProps) {
  const { theme: themeVariant } = useSettings();
  return (
    <Sheet ref={sheetRef} themeVariant={themeVariant}>
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
              sheetRef.current?.dismiss();
            }}
            buttonState="ghost"
            title={skipButton.title}
          />
        </Box>
      </Box>
    </Sheet>
  );
}
