import ArrowTopRight16 from '../assets/icons/arrow-top-right-16-16.svg';
import ArrowTopRight24 from '../assets/icons/arrow-top-right-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowTopRightIcon = createNativeIcon({
  icon: {
    small: ArrowTopRight16,
    medium: ArrowTopRight24,
  },
  displayName: 'ArrowTopRight',
});
