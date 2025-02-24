import Sun16 from '../assets/icons/sun-16-16.svg';
import Sun24 from '../assets/icons/sun-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const SunIcon = createWebIcon({
  icon: {
    small: Sun16,
    medium: Sun24,
  },
  displayName: 'Sun',
});
