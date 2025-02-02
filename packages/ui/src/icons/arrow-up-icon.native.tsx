import ArrowUp16 from '../assets/icons/arrow-up-16-16.svg';
import ArrowUp24 from '../assets/icons/arrow-up-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowUpIcon = createNativeIcon({
  icon: {
    small: ArrowUp16,
    medium: ArrowUp24,
  },
  displayName: 'ArrowUp',
});
