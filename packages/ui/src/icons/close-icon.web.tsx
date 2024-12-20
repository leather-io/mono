import Close16 from '../assets/icons/close-16-16.svg';
import Close24 from '../assets/icons/close-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const CloseIcon = createWebIcon({
  icon: {
    small: Close16,
    medium: Close24,
  },
  displayName: 'Close',
});
