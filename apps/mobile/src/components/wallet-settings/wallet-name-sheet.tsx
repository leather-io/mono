import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { PassportIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheet } from '../sheets/input-sheet.layout';

interface WalletNameSheetProps {
  sheetRef: RefObject<SheetRef>;
  name: string;
  setName(name: string): unknown;
}
export function WalletNameSheet({ sheetRef, name, setName }: WalletNameSheetProps) {
  return (
    <InputSheet
      sheetRef={sheetRef}
      initialValue={name}
      title={t`Change name`}
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
