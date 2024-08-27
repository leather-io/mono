import { RefObject } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import { WarningModal } from '../warning-modal/warning-modal';

interface RemoveWalletModalProps {
  modalRef: RefObject<BottomSheetModal>;
  onSubmit(): unknown;
}
export function RemoveWalletModal({ modalRef, onSubmit }: RemoveWalletModalProps) {
  return (
    <WarningModal
      modalRef={modalRef}
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
