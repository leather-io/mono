import { RefObject, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import { Box, LockIcon } from '@leather.io/ui/native';

import { CLOSED_ANIMATED_SHARED_VALUE, Modal, UIBottomSheetTextInput } from '../bottom-sheet-modal';
import { Button } from '../button';
import { ModalHeader } from '../modal-headers/modal-header';
import { TextInput } from '../text-input';

export interface OptionData {
  title: string;
  id: string;
}

interface RecoverWalletModalProps {
  recoverWalletModalRef: RefObject<BottomSheetModal>;
  passphrase: string;
  setPassphrase(passphrase: string): unknown;
}
export function RecoverWalletModal({
  recoverWalletModalRef,
  passphrase,
  setPassphrase,
}: RecoverWalletModalProps) {
  const animatedPosition = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);
  const [internalPassphrase, setInternalPassphrase] = useState(passphrase);

  return (
    <Modal animatedPosition={animatedPosition} ref={recoverWalletModalRef}>
      <Box p="5" justifyContent="space-between" gap="5">
        <Box>
          <ModalHeader Icon={LockIcon} modalVariant="normal" title={t`BIP39 passphrase`} />
          <TextInput
            value={internalPassphrase}
            onChangeText={text => {
              setInternalPassphrase(text);
            }}
            placeholder={t`Passphrase`}
            mt="4"
            inputState="focused"
            autoCorrect={false}
            autoComplete="off"
            autoFocus
            autoCapitalize="none"
            TextInputComponent={UIBottomSheetTextInput}
          />
        </Box>
        <Button
          onPress={() => {
            recoverWalletModalRef.current?.close();
            setPassphrase(internalPassphrase);
          }}
          buttonState="default"
          title={t`Confirm`}
        />
      </Box>
    </Modal>
  );
}
