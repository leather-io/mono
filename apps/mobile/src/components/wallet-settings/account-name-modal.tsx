import { RefObject } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import { PassportIcon } from '@leather.io/ui/native';

import { InputModal } from '../modals/input-modal';

interface AccountNameModalProps {
  modalRef: RefObject<BottomSheetModal>;
  name: string;
  setName(name: string): unknown;
}
export function AccountNameModal({ modalRef, name, setName }: AccountNameModalProps) {
  return (
    <InputModal
      modalRef={modalRef}
      initialValue={name}
      title={t`Account label`}
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
