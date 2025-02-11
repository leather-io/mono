import ArrowDown16 from '../assets/icons/arrow-down-16-16.svg';
import ArrowDown24 from '../assets/icons/arrow-down-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowDownIcon = createNativeIcon({
  icon: {
    small: ArrowDown16,
    medium: ArrowDown24,
  },
  displayName: 'ArrowDown',
});
