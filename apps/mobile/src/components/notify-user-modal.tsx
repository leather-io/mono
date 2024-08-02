import { RefObject } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import Bell from '@/assets/bell.svg';
import Cross from '@/assets/cross-large.svg';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { CLOSED_ANIMATED_POSITION, Modal } from './bottom-sheet-modal';
import { Button } from './button';
import { TransText } from './trans-text';

export interface OptionData {
  title: string;
  id: string;
}

interface NotifyUserModalProps {
  notifyUserModalRef: RefObject<BottomSheetModal>;
  optionData: OptionData | null;
  onCloseNotificationsModal(): unknown;
}
export function NotifyUserModal({
  notifyUserModalRef,
  optionData,
  onCloseNotificationsModal,
}: NotifyUserModalProps) {
  const animatedPosition = useSharedValue<number>(CLOSED_ANIMATED_POSITION);
  const theme = useTheme<Theme>();
  const { registerPushNotifications } = usePushNotifications();
  async function onNotify() {
    await registerPushNotifications();
    notifyUserModalRef.current?.dismiss();
  }
  return (
    <Modal
      onDismiss={onCloseNotificationsModal}
      animatedPosition={animatedPosition}
      ref={notifyUserModalRef}
    >
      <Box p="5" justifyContent="space-between" gap="5">
        <TouchableOpacity
          onPress={() => {
            notifyUserModalRef.current?.close();
          }}
          p="5"
          right={0}
          top={0}
          zIndex={10}
          position="absolute"
        >
          <Cross height={24} width={24} color={theme.colors['base.ink.text-primary']} />
        </TouchableOpacity>
        <Box gap="4">
          <TransText variant="heading05">Notify me when ready</TransText>
          <Text variant="body01">{t`"${optionData?.title}" isn't ready yet.`}</Text>
        </Box>
        <Button
          onPress={onNotify}
          Icon={Bell}
          buttonState="default"
          title={t`Notify me when it's ready`}
        />
      </Box>
    </Modal>
  );
}
