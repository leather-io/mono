import Stamp16 from '../assets/icons/stamp-16-16.svg';
import Stamp24 from '../assets/icons/stamp-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const StampIcon = createNativeIcon({
  icon: {
    small: Stamp16,
    medium: Stamp24,
  },
  displayName: 'Stamp',
});
