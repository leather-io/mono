import QrCode16 from '../assets/icons/qr-code-16-16.svg';
import QrCode24 from '../assets/icons/qr-code-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const QrCodeIcon = createNativeIcon({
  icon: {
    small: QrCode16,
    medium: QrCode24,
  },
  displayName: 'QrCode',
});
