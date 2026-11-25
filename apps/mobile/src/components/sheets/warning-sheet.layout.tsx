import { t } from '@lingui/core/macro';

import {
  Box,
  Button,
  QuestionCircleIcon,
  Sheet,
  type SheetRef,
  Text,
  TouchableOpacity,
} from '@leather.io/ui/native';

type WarningSheetVariant = 'normal' | 'critical';

interface WarningSheetLayoutProps {
  sheetRef: SheetRef;
  title: string;
  description: string;
  onSubmit(): unknown;
  onPressSupport?(): void;
  variant?: WarningSheetVariant;
  submitTestId?: string;
  cancelTestId?: string;
}
export function WarningSheetLayout({
  sheetRef,
  title,
  description,
  onSubmit,
  variant = 'normal',
  onPressSupport,
  submitTestId,
  cancelTestId,
}: WarningSheetLayoutProps) {
  return (
    <Sheet ref={sheetRef}>
      <Sheet.View justifyContent="space-between" gap="5">
        <Sheet.Header
          leftElement={<Sheet.Title>{title}</Sheet.Title>}
          rightElement={
            onPressSupport ? (
              <TouchableOpacity onPress={onPressSupport} zIndex="10">
                <QuestionCircleIcon variant="small" />
              </TouchableOpacity>
            ) : undefined
          }
        />
        <Box px="5" gap="5">
          <Text>{description}</Text>
          <Box gap="3">
            <Button
              onPress={onSubmit}
              intent={variant === 'critical' ? 'danger' : undefined}
              testID={submitTestId}
            >
              {t`Continue`}
            </Button>
            <Button
              onPress={() => sheetRef.current?.dismiss()}
              variant="ghost"
              testID={cancelTestId}
            >
              {t`Cancel`}
            </Button>
          </Box>
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
