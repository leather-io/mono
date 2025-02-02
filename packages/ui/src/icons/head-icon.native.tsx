import Head16 from '../assets/icons/head-16-16.svg';
import Head24 from '../assets/icons/head-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const HeadIcon = createNativeIcon({
  icon: {
    small: Head16,
    medium: Head24,
  },
  displayName: 'Head',
});
