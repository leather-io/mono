import Unlock16 from '../assets/icons/unlock-16-16.svg';
import Unlock24 from '../assets/icons/unlock-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const UnlockIcon = createNativeIcon({
  icon: {
    small: Unlock16,
    medium: Unlock24,
  },
  displayName: 'Unlock',
});
