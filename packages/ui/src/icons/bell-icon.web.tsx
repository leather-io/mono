import Bell16 from '../assets/icons/bell-16-16.svg';
import Bell24 from '../assets/icons/bell-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const BellIcon = createWebIcon({
  icon: {
    small: Bell16,
    medium: Bell24,
  },
  displayName: 'Bell',
});
