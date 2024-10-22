import { RefObject } from 'react';

import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import { PassportIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheet } from '../sheets/input-sheet.layout';

interface WalletNameSheetProps {
  sheetRef: RefObject<SheetRef>;
  name: string;
  setName(name: string): { success: boolean };
}
export function WalletNameSheet({ sheetRef, name, setName }: WalletNameSheetProps) {
  return (
    <InputSheet
      sheetRef={sheetRef}
      initialValue={name}
      title={t({ id: 'wallet_name.header_title', message: 'Change name' })}
      TitleIcon={PassportIcon}
      placeholder={t({ id: 'wallet_name.input_placeholder', message: 'Name' })}
      submitTitle={t({ id: 'wallet_name.button', message: 'Save' })}
      onSubmit={newName => {
        const { success } = setName(newName);
        if (success) {
          sheetRef.current?.close();
        }
      }}
      inputTestId={TestId.walletChangeNameSheetInput}
      submitTestId={TestId.walletChangeNameSheetSaveButton}
    />
  );
}
