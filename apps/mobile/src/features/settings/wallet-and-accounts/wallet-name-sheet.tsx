import { InputSheetLayout } from '@/components/sheets/input-sheet.layout';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

interface WalletNameSheetProps {
  sheetRef: SheetRef;
  name: string;
  setName(name: string): { success: boolean };
}
export function WalletNameSheet({ sheetRef, name, setName }: WalletNameSheetProps) {
  return (
    <InputSheetLayout
      sheetRef={sheetRef}
      initialValue={name}
      title={t`Change name`}
      placeholder={t`Name`}
      submitTitle={t`Save`}
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
