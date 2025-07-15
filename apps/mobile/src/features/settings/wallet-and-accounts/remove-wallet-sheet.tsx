import { RefObject } from 'react';

import { WarningSheetLayout } from '@/components/sheets/warning-sheet.layout';
import { useOpenURL } from '@/features/browser/browser/use-open-url';
import { LEATHER_GUIDES_MOBILE_REMOVE_WALLET } from '@/shared/constants';
import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

interface RemoveWalletSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  onSubmit(): unknown;
}
export function RemoveWalletSheet({ sheetRef, onSubmit }: RemoveWalletSheetProps) {
  const { openURL } = useOpenURL();
  return (
    <WarningSheetLayout
      sheetRef={sheetRef}
      title={t({
        id: 'remove_wallet.header_title',
        message: `Remove wallet`,
      })}
      description={t({
        id: 'remove_wallet.warning_caption',
        message: `Proceed with caution since the wallet will be removed entirely from this device and its assets will not be recoverable unless you've stored its Secret Key elsewhere securely.`,
      })}
      variant="critical"
      onSubmit={onSubmit}
      onPressSupport={() => openURL(LEATHER_GUIDES_MOBILE_REMOVE_WALLET)}
    />
  );
}
