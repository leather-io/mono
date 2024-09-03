import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { LockIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheet } from '../sheets/input-sheet';

export interface OptionData {
  title: string;
  id: string;
}

interface RecoverWalletModalProps {
  recoverWalletModalRef: RefObject<SheetRef>;
  passphrase: string;
  setPassphrase(passphrase: string): unknown;
}
export function RecoverWalletModal({
  recoverWalletModalRef,
  passphrase,
  setPassphrase,
}: RecoverWalletModalProps) {
  return (
    <InputSheet
      sheetRef={recoverWalletModalRef}
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
