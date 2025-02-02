import Lock16 from '../assets/icons/lock-16-16.svg';
import Lock24 from '../assets/icons/lock-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const LockIcon = createWebIcon({
  icon: {
    small: Lock16,
    medium: Lock24,
  },
  displayName: 'Lock',
});
