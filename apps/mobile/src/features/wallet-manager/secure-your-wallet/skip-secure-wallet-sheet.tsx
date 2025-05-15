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
      sheetRef={sheetRef}
      title={t({
        id: 'skip_secure_wallet.header_title',
        message: `Proceed without security`,
      })}
      description={t({
        id: 'skip_secure_wallet.warning_caption',
        message: `Skipping security setup means your wallet will not be protected by your device’s security features. We highly recommend enabling security to protect your assets`,
      })}
      onSubmit={onSubmit}
    />
  );
}
