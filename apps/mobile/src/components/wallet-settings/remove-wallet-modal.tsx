import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

import { WarningSheet } from '../sheets/warning-sheet';

interface RemoveWalletModalProps {
  sheetRef: RefObject<SheetRef>;
  onSubmit(): unknown;
}
export function RemoveWalletModal({ sheetRef, onSubmit }: RemoveWalletModalProps) {
  return (
    <WarningSheet
      sheetRef={sheetRef}
      title={t`Remove wallet`}
      variant="critical"
      description={t`The wallet will be removed from this device. You will lose access to all tokens and collectibles associated with this wallet. 
                     Before proceeding, make sure you have securely saved your secret key. Without it, you won't be able to access your tokens or collectibles from another device.`}
      submitButton={{
        title: t`Proceed`,
        onPress: onSubmit,
      }}
      skipButton={{
        title: t`Cancel`,
      }}
      onPressSupport={() => {
        // TODO: add support link
      }}
    />
  );
}
