import Mobile16 from '../assets/icons/mobile-16-16.svg';
import Mobile24 from '../assets/icons/mobile-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const MobileIcon = createWebIcon({
  icon: {
    small: Mobile16,
    medium: Mobile24,
  },
  displayName: 'Mobile',
});
