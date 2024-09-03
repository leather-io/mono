import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

import { WarningSheet } from '../sheets/warning-sheet';

interface SkipSecureWalletModalProps {
  skipSecureWalletModalRef: RefObject<SheetRef>;
  onSubmit(): unknown;
}
export function SkipSecureWalletModal({
  skipSecureWalletModalRef,
  onSubmit,
}: SkipSecureWalletModalProps) {
  return (
    <WarningSheet
      sheetRef={skipSecureWalletModalRef}
      title={t`Proceed without security`}
      description={t`Skipping security setup means your wallet will not be protected by your device’s security features. We highly recommend enabling security to protect your assets`}
      variant="normal"
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
