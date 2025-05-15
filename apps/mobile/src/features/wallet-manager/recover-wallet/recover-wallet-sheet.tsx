import { RefObject } from 'react';

import { InputSheetLayout } from '@/components/sheets/input-sheet.layout';
import { t } from '@lingui/macro';

import { LockIcon, SheetRef } from '@leather.io/ui/native';

interface RecoverWalletSheetProps {
  recoverWalletSheetRef: RefObject<SheetRef | null>;
  passphrase: string;
  setPassphrase(passphrase: string): unknown;
}
export function RecoverWalletSheet({
  recoverWalletSheetRef,
  passphrase,
  setPassphrase,
}: RecoverWalletSheetProps) {
  return (
    <InputSheetLayout
      sheetRef={recoverWalletSheetRef}
      initialValue={passphrase}
      title={t({
        id: 'recover_wallet.passphrase.header_title',
        message: `BIP39 passphrase`,
      })}
      icon={<LockIcon />}
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
