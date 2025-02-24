import Key16 from '../assets/icons/key-16-16.svg';
import Key24 from '../assets/icons/key-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const KeyIcon = createWebIcon({
  icon: {
    small: Key16,
    medium: Key24,
  },
  displayName: 'Key',
});
