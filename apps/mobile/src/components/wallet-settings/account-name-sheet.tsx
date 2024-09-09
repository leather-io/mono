import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { PassportIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheet } from '../sheets/input-sheet.layout';

interface AccountNameSheetProps {
  sheetRef: RefObject<SheetRef>;
  name: string;
  setName(name: string): unknown;
}
export function AccountNameSheet({ sheetRef, name, setName }: AccountNameSheetProps) {
  return (
    <InputSheet
      sheetRef={sheetRef}
      initialValue={name}
      title={t`Account label`}
      TitleIcon={PassportIcon}
      placeholder={t`Name`}
      submitTitle={t`Save`}
      onSubmit={newName => {
        sheetRef.current?.close();
        setName(newName);
      }}
    />
  );
}
