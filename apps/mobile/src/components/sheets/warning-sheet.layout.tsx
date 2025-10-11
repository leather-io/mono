import { t } from '@lingui/core/macro';

import {
  Box,
  Button,
  QuestionCircleIcon,
  Sheet,
  SheetRef,
  Text,
  TouchableOpacity,
} from '@leather.io/ui/native';

type WarningSheetVariant = 'normal' | 'critical';

interface WarningSheetLayoutProps {
  sheetRef: SheetRef;
  title: string;
  description: string;
  onSubmit(): unknown;
  onPressSupport?: () => void;
  variant?: WarningSheetVariant;
  onCancel?: () => void;
}
export function WarningSheetLayout({
  sheetRef,
  title,
  description,
  onSubmit,
  variant = 'normal',
  onPressSupport,
  onCancel,
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
            <Button onPress={onSubmit} intent={variant === 'critical' ? 'danger' : undefined}>
              {t`Continue`}
            </Button>
            <Button
              onPress={() => {
                onCancel?.();
                sheetRef.current?.dismiss();
              }}
              variant="ghost"
            >
              {t`Cancel`}
            </Button>
          </Box>
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
