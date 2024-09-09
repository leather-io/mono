import { RefObject } from 'react';

import { WarningSheet } from '@/components/sheets/warning-sheet.layout';
import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

interface RemoveWalletSheetProps {
  sheetRef: RefObject<SheetRef>;
  onSubmit(): unknown;
}
export function RemoveWalletSheet({ sheetRef, onSubmit }: RemoveWalletSheetProps) {
  return (
    <WarningSheet
      sheetRef={sheetRef}
      title={t`Remove wallet`}
      description={t`The wallet will be removed from this device. You will lose access to all tokens and collectibles associated with this wallet. 
                     Before proceeding, make sure you have securely saved your secret key. Without it, you won't be able to access your tokens or collectibles from another device.`}
      variant="critical"
      onSubmit={onSubmit}
    />
  );
}
