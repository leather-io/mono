import { RefObject } from 'react';

import { t } from '@lingui/macro';

import { PassportIcon, SheetRef } from '@leather.io/ui/native';

import { InputSheet } from '../sheets/input-sheet';

interface WalletNameModalProps {
  sheetRef: RefObject<SheetRef>;
  name: string;
  setName(name: string): unknown;
}
export function WalletNameModal({ sheetRef, name, setName }: WalletNameModalProps) {
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
