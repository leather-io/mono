import { RefObject } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { usePushNotifications } from '@/hooks/use-push-notifications';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  BellAlarmIcon,
  Box,
  CloseIcon,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

import { CLOSED_ANIMATED_SHARED_VALUE, Modal } from './bottom-sheet-modal';
import { Button, getTextColor } from './button';

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
  const animatedPosition = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);
  const theme = useTheme<Theme>();
  const { registerPushNotifications } = usePushNotifications();
  async function onNotify() {
    await registerPushNotifications();
    notifyUserModalRef.current?.dismiss();
  }
  const title = optionData?.title;

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
          <CloseIcon />
        </TouchableOpacity>
        <Box gap="4">
          <Text variant="heading05">{t`Notify me when ready`}</Text>
          <Text variant="body01">{t`"${title}" isn't ready yet.`}</Text>
        </Box>
        <Button
          onPress={onNotify}
          icon={<BellAlarmIcon color={theme.colors[getTextColor('default')]} />}
          buttonState="default"
          title={t`Notify me when it's ready`}
        />
      </Box>
    </Modal>
  );
}
