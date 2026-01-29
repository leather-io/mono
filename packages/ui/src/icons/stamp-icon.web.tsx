import Stamp16 from '../assets/icons/stamp-16-16.svg';
import Stamp24 from '../assets/icons/stamp-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const StampIcon = createWebIcon({
  icon: {
    small: Stamp16,
    medium: Stamp24,
  },
  displayName: 'Stamp',
});
