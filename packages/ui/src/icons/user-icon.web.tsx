import User16 from '../assets/icons/user-16-16.svg';
import User24 from '../assets/icons/user-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const UserIcon = createWebIcon({
  icon: {
    small: User16,
    medium: User24,
  },
  displayName: 'User',
});
