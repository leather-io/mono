import { RefObject } from 'react';

import { InputSheetLayout } from '@/components/sheets/input-sheet.layout';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

interface AccountNameSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  name: string;
  setName(name: string): { success: boolean };
}
export function AccountNameSheet({ sheetRef, name, setName }: AccountNameSheetProps) {
  return (
    <InputSheetLayout
      sheetRef={sheetRef}
      initialValue={name}
      title={t`Account label`}
      placeholder={t`Name`}
      submitTitle={t`Save`}
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
