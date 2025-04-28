import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';

import { t } from '@lingui/macro';
import { PermissionStatus, useCameraPermissions as useExpoCameraPermissions } from 'expo-camera';

interface UseCameraPermissionProps {
  onDenied?: () => void;
}

export function useCameraPermission({ onDenied = showCameraAlert }: UseCameraPermissionProps = {}) {
  const [permission, requestPermission] = useExpoCameraPermissions();

  useEffect(() => {
    if (!permission) return;

    const { status, canAskAgain } = permission;

    if (
      status === PermissionStatus.UNDETERMINED ||
      (status === PermissionStatus.DENIED && canAskAgain)
    ) {
      void requestPermission();
    }

    if (status === PermissionStatus.DENIED) {
      onDenied();
    }
  }, [permission, requestPermission, onDenied]);

  return permission?.granted === true;
}

function showCameraAlert() {
  const messages = {
    title: t({
      id: 'qr_scanner.camera_alert.title',
      message: 'Allow Camera Access',
    }),
    message: t({
      id: 'qr_scanner.camera_alert.message',
      message: 'Turn on camera access in Settings to scan a QR.',
    }),
    actionLabel: t({
      id: 'qr_scanner.camera_alert.action_label',
      message: 'Settings',
    }),
    cancelLabel: t({
      id: 'qr_scanner.camera_alert.cancel_label',
      message: 'Cancel',
    }),
  };

  Alert.alert(messages.title, messages.message, [
    {
      text: messages.cancelLabel,
      style: 'cancel',
    },
    {
      text: messages.actionLabel,
      onPress: () => Linking.openSettings(),
    },
  ]);
}
