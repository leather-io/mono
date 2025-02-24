import ArrowTopBottom16 from '../assets/icons/arrow-top-bottom-16-16.svg';
import ArrowTopBottom24 from '../assets/icons/arrow-top-bottom-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowTopBottomIcon = createNativeIcon({
  icon: {
    small: ArrowTopBottom16,
    medium: ArrowTopBottom24,
  },
  displayName: 'ArrowTopBottom',
});
