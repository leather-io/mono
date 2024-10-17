import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  Box,
  Button,
  ErrorTriangleIcon,
  Sheet,
  SheetHeader,
  SheetRef,
  Text,
  Theme,
} from '@leather.io/ui/native';

import { WarningSheetVariant } from './types';

interface WarningSheetProps {
  sheetRef: RefObject<SheetRef>;
  title: string;
  description: string;
  onSubmit(): unknown;
  onPressSupport?(): unknown;
  variant?: WarningSheetVariant;
}

export function WarningSheet({
  sheetRef,
  title,
  description,
  onSubmit,
  variant = 'normal',
}: WarningSheetProps) {
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();
  return (
    <Sheet ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box p="5" justifyContent="space-between" gap="5">
        <Box gap="5">
          <Box>
            <SheetHeader
              title={title}
              icon={
                <Box
                  bg={
                    variant === 'critical' ? 'red.background-primary' : 'ink.background-secondary'
                  }
                  borderRadius="round"
                  flexDirection="row"
                  p="2"
                >
                  <ErrorTriangleIcon
                    color={
                      theme.colors[
                        variant === 'critical' ? 'red.action-primary-default' : 'ink.text-primary'
                      ]
                    }
                  />
                </Box>
              }
              onPressSupport={() => {
                // TODO: add support link
              }}
            />
          </Box>
          <Text>{description}</Text>
        </Box>
        <Box gap="3">
          <Button
            onPress={onSubmit}
            buttonState={variant === 'critical' ? 'critical' : 'default'}
            title={t({
              id: 'warning.submit_button',
              message: `Proceed`,
            })}
          />
          <Button
            onPress={() => sheetRef.current?.dismiss()}
            buttonState="ghost"
            title={t({
              id: 'warning.cancel_button',
              message: `Cancel`,
            })}
          />
        </Box>
      </Box>
    </Sheet>
  );
}
