import Head16 from '../assets/icons/head-16-16.svg';
import Head24 from '../assets/icons/head-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const HeadIcon = createWebIcon({
  icon: {
    small: Head16,
    medium: Head24,
  },
  displayName: 'Head',
});
