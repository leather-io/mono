import { WarningSheetLayout } from '@/components/sheets/warning-sheet.layout';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

interface GoogleWalletOverrideSheetProps {
  sheetRef: SheetRef;
  onConfirm(): void;
  onCancel(): void;
}

export function GoogleWalletOverrideSheet({
  sheetRef,
  onConfirm,
  onCancel,
}: GoogleWalletOverrideSheetProps) {
  return (
    <WarningSheetLayout
      sheetRef={sheetRef}
      variant="critical"
      title={t`Replace existing cloud backup?`}
      description={t`A Google Drive backup for your account already exists. Continuing will delete the previous backup and replace it with a copy of this one. Are you sure you want to proceed?`}
      onSubmit={onConfirm}
      onCancel={onCancel}
    />
  );
}
