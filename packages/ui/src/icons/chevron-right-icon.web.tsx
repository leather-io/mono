import ChevronRight16 from '../assets/icons/chevron-right-16-16.svg';
import ChevronRight24 from '../assets/icons/chevron-right-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ChevronRightIcon = createWebIcon({
  icon: {
    small: ChevronRight16,
    medium: ChevronRight24,
  },
  displayName: 'ChevronRight',
});
