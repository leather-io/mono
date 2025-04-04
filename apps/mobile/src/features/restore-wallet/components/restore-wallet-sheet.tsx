import { RefObject } from 'react';

import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import { LockIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheetLayout } from '../../../components/sheets/input-sheet.layout';

interface RestoreWalletSheetProps {
  restoreWalletSheetRef: RefObject<SheetRef>;
  passphrase: string;
  setPassphrase(passphrase: string): unknown;
}
export function RestoreWalletSheet({
  restoreWalletSheetRef,
  passphrase,
  setPassphrase,
}: RestoreWalletSheetProps) {
  return (
    <InputSheetLayout
      inputTestId={TestId.restoreWalletPassphraseInput}
      submitTestId={TestId.restoreWalletPassphraseSubmit}
      sheetRef={restoreWalletSheetRef}
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
        restoreWalletSheetRef.current?.close();
        setPassphrase(newPassphrase);
      }}
    />
  );
}
