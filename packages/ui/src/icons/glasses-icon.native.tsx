import Glasses16 from '../assets/icons/glasses-16-16.svg';
import Glasses24 from '../assets/icons/glasses-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const GlassesIcon = createNativeIcon({
  icon: {
    small: Glasses16,
    medium: Glasses24,
  },
  displayName: 'Glasses',
});
