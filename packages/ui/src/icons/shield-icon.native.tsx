import Shield16 from '../assets/icons/shield-16-16.svg';
import Shield24 from '../assets/icons/shield-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ShieldIcon = createNativeIcon({
  icon: {
    small: Shield16,
    medium: Shield24,
  },
  displayName: 'Shield',
});
