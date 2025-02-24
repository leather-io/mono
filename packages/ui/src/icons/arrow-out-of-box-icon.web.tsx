import ArrowOutOfBox16 from '../assets/icons/arrow-out-of-box-16-16.svg';
import ArrowOutOfBox24 from '../assets/icons/arrow-out-of-box-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ArrowOutOfBoxIcon = createWebIcon({
  icon: {
    small: ArrowOutOfBox16,
    medium: ArrowOutOfBox24,
  },
  displayName: 'ArrowOutOfBox',
});
