import ChevronRight16 from '../assets/icons/chevron-right-16-16.svg';
import ChevronRight24 from '../assets/icons/chevron-right-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ChevronRightIcon = createNativeIcon({
  icon: {
    small: ChevronRight16,
    medium: ChevronRight24,
  },
  displayName: 'ChevronRight',
});
