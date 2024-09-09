import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { LockIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheet } from '../sheets/input-sheet.layout';

export interface OptionData {
  title: string;
  id: string;
}

interface RecoverWalletSheetProps {
  recoverWalletSheetRef: RefObject<SheetRef>;
  passphrase: string;
  setPassphrase(passphrase: string): unknown;
}
export function RecoverWalletSheet({
  recoverWalletSheetRef,
  passphrase,
  setPassphrase,
}: RecoverWalletSheetProps) {
  return (
    <InputSheet
      sheetRef={recoverWalletSheetRef}
      initialValue={passphrase}
      title={t`BIP39 passphrase`}
      TitleIcon={LockIcon}
      placeholder={t`Passphrase`}
      submitTitle={t`Confirm`}
      onSubmit={newPassphrase => {
        recoverWalletSheetRef.current?.close();
        setPassphrase(newPassphrase);
      }}
    />
  );
}
