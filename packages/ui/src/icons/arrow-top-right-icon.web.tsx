import ArrowTopRight16 from '../assets/icons/arrow-top-right-16-16.svg';
import ArrowTopRight24 from '../assets/icons/arrow-top-right-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ArrowTopRightIcon = createWebIcon({
  icon: {
    small: ArrowTopRight16,
    medium: ArrowTopRight24,
  },
  displayName: 'ArrowTopRight',
});
