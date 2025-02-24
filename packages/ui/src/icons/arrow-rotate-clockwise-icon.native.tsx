import ArrowRotateClockwise16 from '../assets/icons/arrow-rotate-clockwise-16-16.svg';
import ArrowRotateClockwise24 from '../assets/icons/arrow-rotate-clockwise-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowRotateClockwiseIcon = createNativeIcon({
  icon: {
    small: ArrowRotateClockwise16,
    medium: ArrowRotateClockwise24,
  },
  displayName: 'ArrowRotateClockwise',
});
