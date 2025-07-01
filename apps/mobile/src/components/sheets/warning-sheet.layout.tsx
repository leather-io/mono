import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { Box, Button, Sheet, SheetHeader, SheetRef, Text } from '@leather.io/ui/native';

type WarningSheetVariant = 'normal' | 'critical';

interface WarningSheetLayoutProps {
  sheetRef: RefObject<SheetRef | null>;
  title: string;
  description: string;
  onSubmit(): unknown;
  onPressSupport?: () => void;
  variant?: WarningSheetVariant;
}
export function WarningSheetLayout({
  sheetRef,
  title,
  description,
  onSubmit,
  variant = 'normal',
  onPressSupport,
}: WarningSheetLayoutProps) {
  const { themeDerivedFromThemePreference } = useSettings();
  return (
    <Sheet ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box p="5" justifyContent="space-between" gap="5">
        <Box gap="5">
          <Box>
            <SheetHeader
              onPressSupport={onPressSupport ? onPressSupport : undefined}
              title={title}
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
              message: 'Continue',
            })}
          />
          <Button
            onPress={() => sheetRef.current?.dismiss()}
            buttonState="ghost"
            title={t({
              id: 'warning.cancel_button',
              message: 'Cancel',
            })}
          />
        </Box>
      </Box>
    </Sheet>
  );
}
