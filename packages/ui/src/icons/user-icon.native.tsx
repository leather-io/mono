import User16 from '../assets/icons/user-16-16.svg';
import User24 from '../assets/icons/user-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const UserIcon = createNativeIcon({
  icon: {
    small: User16,
    medium: User24,
  },
  displayName: 'User',
});
