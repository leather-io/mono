import ArrowRotateClockwise16 from '../assets/icons/arrow-rotate-clockwise-16-16.svg';
import ArrowRotateClockwise24 from '../assets/icons/arrow-rotate-clockwise-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ArrowRotateClockwiseIcon = createWebIcon({
  icon: {
    small: ArrowRotateClockwise16,
    medium: ArrowRotateClockwise24,
  },
  displayName: 'ArrowRotateClockwise',
});
