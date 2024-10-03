import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { LockIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheet } from '../sheets/input-sheet.layout';

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
      title={t({
        id: 'recover_wallet.passphrase.header_title',
        message: `BIP39 passphrase`,
      })}
      TitleIcon={LockIcon}
      placeholder={t({
        id: 'recover_wallet.passphrase.input_placeholder',
        message: `Passphrase`,
      })}
      submitTitle={t({
        id: 'recover_wallet.passphrase.button',
        message: `Confirm`,
      })}
      onSubmit={newPassphrase => {
        recoverWalletSheetRef.current?.close();
        setPassphrase(newPassphrase);
      }}
    />
  );
}
