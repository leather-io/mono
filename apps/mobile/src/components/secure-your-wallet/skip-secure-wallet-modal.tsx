import { RefObject } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import Cross from '@/assets/cross-large.svg';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { CLOSED_ANIMATED_POSITION, Modal } from '../bottom-sheet-modal';
import { Button } from '../button';

interface SkipSecureWalletModalProps {
  skipSecureWalletModalRef: RefObject<BottomSheetModal>;
  onSkip(): unknown;
}
export function SkipSecureWalletModal({
  skipSecureWalletModalRef,
  onSkip,
}: SkipSecureWalletModalProps) {
  const animatedPosition = useSharedValue<number>(CLOSED_ANIMATED_POSITION);
  const theme = useTheme<Theme>();
  return (
    <Modal animatedPosition={animatedPosition} ref={skipSecureWalletModalRef}>
      <Box p="5" justifyContent="space-between" gap="5">
        <TouchableOpacity
          onPress={() => {
            skipSecureWalletModalRef.current?.close();
          }}
          p="5"
          right={0}
          top={0}
          zIndex={10}
          position="absolute"
        >
          <Cross height={24} width={24} color={theme.colors['ink.text-primary']} />
        </TouchableOpacity>
        <Box gap="4">
          <Text variant="heading05">{t`Sure You Want to Skip?`}</Text>
          <Text variant="body01">
            {t`Skipping security setup means your wallet will not be protected by your device’s
            security features. We highly recommend enabling security to protect your assets`}
          </Text>
        </Box>
        <Button onPress={onSkip} buttonState="default" title={t`Yes, skip for now`} />
      </Box>
    </Modal>
  );
}
