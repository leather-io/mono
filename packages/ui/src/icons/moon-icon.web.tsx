import Moon16 from '../assets/icons/moon-16-16.svg';
import Moon24 from '../assets/icons/moon-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const MoonIcon = createWebIcon({
  icon: {
    small: Moon16,
    medium: Moon24,
  },
  displayName: 'Moon',
});
