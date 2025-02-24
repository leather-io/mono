import QrCode16 from '../assets/icons/qr-code-16-16.svg';
import QrCode24 from '../assets/icons/qr-code-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const QrCodeIcon = createWebIcon({
  icon: {
    small: QrCode16,
    medium: QrCode24,
  },
  displayName: 'QrCode',
});
