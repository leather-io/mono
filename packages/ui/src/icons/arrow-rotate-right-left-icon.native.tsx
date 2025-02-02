import ArrowRotateRightLeft16 from '../assets/icons/arrow-rotate-right-left-16-16.svg';
import ArrowRotateRightLeft24 from '../assets/icons/arrow-rotate-right-left-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowRotateRightLeftIcon = createNativeIcon({
  icon: {
    small: ArrowRotateRightLeft16,
    medium: ArrowRotateRightLeft24,
  },
  displayName: 'ArrowRotateRightLeft',
});
