import Shield16 from '../assets/icons/shield-16-16.svg';
import Shield24 from '../assets/icons/shield-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ShieldIcon = createWebIcon({
  icon: {
    small: Shield16,
    medium: Shield24,
  },
  displayName: 'Shield',
});
