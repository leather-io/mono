import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

import { WarningSheet } from '../sheets/warning-sheet.layout';

interface SkipSecureWalletSheetProps {
  sheetRef: RefObject<SheetRef>;
  onSubmit(): void;
}
export function SkipSecureWalletSheet({ sheetRef, onSubmit }: SkipSecureWalletSheetProps) {
  return (
    <WarningSheet
      sheetRef={sheetRef}
      title={t`Proceed without security`}
      description={t`Skipping security setup means your wallet will not be protected by your device’s security features. We highly recommend enabling security to protect your assets`}
      onSubmit={onSubmit}
    />
  );
}
