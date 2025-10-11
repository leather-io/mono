import { WarningSheetLayout } from '@/components/sheets/warning-sheet.layout';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

interface ForgotPasswordSheetProps {
  sheetRef: SheetRef;
  onSubmit(): void;
  isLoading?: boolean;
}

export function ForgotPasswordSheet({ sheetRef, onSubmit }: ForgotPasswordSheetProps) {
  return (
    <WarningSheetLayout
      variant="critical"
      sheetRef={sheetRef}
      title={t`Delete Google Backup?`}
      description={t`If you forgot your password, you'll need to delete your Google Drive backup to create a new one. This action cannot be undone. Make sure you have your Secret Key backed up elsewhere.`}
      onSubmit={onSubmit}
    />
  );
}
