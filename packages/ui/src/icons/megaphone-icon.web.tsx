import Megaphone16 from '../assets/icons/megaphone-16-16.svg';
import Megaphone24 from '../assets/icons/megaphone-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const MegaphoneIcon = createWebIcon({
  icon: {
    small: Megaphone16,
    medium: Megaphone24,
  },
  displayName: 'Megaphone',
});
