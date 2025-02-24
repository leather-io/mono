import Lock16 from '../assets/icons/lock-16-16.svg';
import Lock24 from '../assets/icons/lock-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const LockIcon = createNativeIcon({
  icon: {
    small: Lock16,
    medium: Lock24,
  },
  displayName: 'Lock',
});
