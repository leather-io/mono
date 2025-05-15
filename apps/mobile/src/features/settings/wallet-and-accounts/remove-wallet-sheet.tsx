import { RefObject } from 'react';
import { Linking } from 'react-native';

import { WarningSheetLayout } from '@/components/sheets/warning-sheet.layout';
import { LEATHER_GUIDES_MOBILE_REMOVE_WALLET } from '@/shared/constants';
import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

interface RemoveWalletSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  onSubmit(): unknown;
}
export function RemoveWalletSheet({ sheetRef, onSubmit }: RemoveWalletSheetProps) {
  return (
    <WarningSheetLayout
      sheetRef={sheetRef}
      title={t({
        id: 'remove_wallet.header_title',
        message: `Remove wallet`,
      })}
      description={t({
        id: 'remove_wallet.warning_caption',
        message: `The wallet will be removed from this device. You will lose access to all tokens and collectibles associated with this wallet.
                     Before proceeding, make sure you have securely saved your secret key. Without it, you won't be able to access your tokens or collectibles from another device.`,
      })}
      variant="critical"
      onSubmit={onSubmit}
      onPressSupport={() => void Linking.openURL(LEATHER_GUIDES_MOBILE_REMOVE_WALLET)}
    />
  );
}
