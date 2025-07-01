import { RefObject } from 'react';

import { WarningSheetLayout } from '@/components/sheets/warning-sheet.layout';
import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

interface SkipSecureWalletSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  onSubmit(): void;
}
export function SkipSecureWalletSheet({ sheetRef, onSubmit }: SkipSecureWalletSheetProps) {
  return (
    <WarningSheetLayout
      variant="critical"
      sheetRef={sheetRef}
      title={t({
        id: 'skip_secure_wallet.header_title',
        message: 'Continue without security',
      })}
      description={t({
        id: 'skip_secure_wallet.warning_caption',
        message:
          'Proceed with caution since your wallet will not be protected by your device’s native security mechanism.',
      })}
      onSubmit={onSubmit}
    />
  );
}
