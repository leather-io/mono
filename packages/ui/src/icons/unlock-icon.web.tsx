import Unlock16 from '../assets/icons/unlock-16-16.svg';
import Unlock24 from '../assets/icons/unlock-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const UnlockIcon = createWebIcon({
  icon: {
    small: Unlock16,
    medium: Unlock24,
  },
  displayName: 'Unlock',
});
