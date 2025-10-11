import { WarningSheetLayout } from '@/components/sheets/warning-sheet.layout';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

interface RemoveGoogleWalletSheetProps {
  sheetRef: SheetRef;
  onSubmit(): unknown;
}

export function RemoveGoogleWalletSheet({ sheetRef, onSubmit }: RemoveGoogleWalletSheetProps) {
  return (
    <WarningSheetLayout
      sheetRef={sheetRef}
      title={t`Remove wallet and cloud backup`}
      description={t`This will permanently delete both your wallet from this device and its backup from Google Drive. Your assets will not be recoverable unless you've stored your Secret Key elsewhere securely.`}
      variant="critical"
      onSubmit={onSubmit}
    />
  );
}
