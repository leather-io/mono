import { RefObject, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import { Box, LockIcon, Text } from '@leather.io/ui/native';

import { CLOSED_ANIMATED_POSITION, Modal, UIBottomSheetTextInput } from '../bottom-sheet-modal';
import { Button } from '../button';
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
  const animatedPosition = useSharedValue<number>(CLOSED_ANIMATED_POSITION);
  const [internalPassphrase, setInternalPassphrase] = useState(passphrase);

  return (
    <Modal animatedPosition={animatedPosition} ref={recoverWalletModalRef}>
      <Box p="5" justifyContent="space-between" gap="5">
        <Box>
          <Box flexDirection="row" alignItems="center" gap="3">
            <Box flexDirection="row" p="2" bg="ink.background-secondary" borderRadius="round">
              <LockIcon />
            </Box>
            <Text variant="heading05">{t`BIP39 passphrase`}</Text>
          </Box>
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
