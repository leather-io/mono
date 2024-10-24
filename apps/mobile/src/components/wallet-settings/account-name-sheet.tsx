import { RefObject } from 'react';

import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import { PassportIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheet } from '../sheets/input-sheet.layout';

interface AccountNameSheetProps {
  sheetRef: RefObject<SheetRef>;
  name: string;
  setName(name: string): { success: boolean };
}
export function AccountNameSheet({ sheetRef, name, setName }: AccountNameSheetProps) {
  return (
    <InputSheet
      sheetRef={sheetRef}
      initialValue={name}
      title={t({ id: 'account_name.header_title', message: 'Account label' })}
      TitleIcon={PassportIcon}
      placeholder={t({ id: 'account_name.input_placeholder', message: 'Name' })}
      submitTitle={t({ id: 'account_name.button', message: 'Save' })}
      onSubmit={newName => {
        const { success } = setName(newName);
        if (success) {
          sheetRef.current?.close();
        }
      }}
      inputTestId={TestId.accountChangeNameSheetInput}
      submitTestId={TestId.accountChangeNameSheetSaveButton}
    />
  );
}
