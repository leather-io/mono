import ArrowOutOfBox16 from '../assets/icons/arrow-out-of-box-16-16.svg';
import ArrowOutOfBox24 from '../assets/icons/arrow-out-of-box-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowOutOfBoxIcon = createNativeIcon({
  icon: {
    small: ArrowOutOfBox16,
    medium: ArrowOutOfBox24,
  },
  displayName: 'ArrowOutOfBox',
});
