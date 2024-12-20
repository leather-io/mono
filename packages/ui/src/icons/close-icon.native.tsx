import Close16 from '../assets/icons/close-16-16.svg';
import Close24 from '../assets/icons/close-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const CloseIcon = createNativeIcon({
  icon: {
    small: Close16,
    medium: Close24,
  },
  displayName: 'Close',
});
