import { RefObject } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import { WarningModal } from '../warning-modal/warning-modal';

interface SkipSecureWalletModalProps {
  skipSecureWalletModalRef: RefObject<BottomSheetModal>;
  onSubmit(): unknown;
}
export function SkipSecureWalletModal({
  skipSecureWalletModalRef,
  onSubmit,
}: SkipSecureWalletModalProps) {
  return (
    <WarningModal
      modalRef={skipSecureWalletModalRef}
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
