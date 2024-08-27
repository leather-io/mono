import { RefObject } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import { PassportIcon } from '@leather.io/ui/native';

import { InputModal } from '../modals/input-modal';

interface WalletNameModalProps {
  modalRef: RefObject<BottomSheetModal>;
  name: string;
  setName(name: string): unknown;
}
export function WalletNameModal({ modalRef, name, setName }: WalletNameModalProps) {
  return (
    <InputModal
      modalRef={modalRef}
      initialValue={name}
      title={t`Change name`}
      TitleIcon={PassportIcon}
      placeholder={t`Name`}
      submitTitle={t`Save`}
      onSubmit={newName => {
        modalRef.current?.close();
        setName(newName);
      }}
    />
  );
}
