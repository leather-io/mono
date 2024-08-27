import { RefObject } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import { LockIcon } from '@leather.io/ui/native';

import { InputModal } from '../modals/input-modal';

export interface OptionData {
  title: string;
  id: string;
}

interface RecoverWalletModalProps {
  recoverWalletModalRef: RefObject<BottomSheetModal>;
  passphrase: string;
  setPassphrase(passphrase: string): unknown;
}
export function RecoverWalletModal({
  recoverWalletModalRef,
  passphrase,
  setPassphrase,
}: RecoverWalletModalProps) {
  return (
    <InputModal
      modalRef={recoverWalletModalRef}
      initialValue={passphrase}
      title={t`BIP39 passphrase`}
      TitleIcon={LockIcon}
      placeholder={t`Passphrase`}
      submitTitle={t`Confirm`}
      onSubmit={newPassphrase => {
        recoverWalletModalRef.current?.close();
        setPassphrase(newPassphrase);
      }}
    />
  );
}
