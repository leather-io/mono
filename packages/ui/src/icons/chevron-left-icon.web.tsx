import ChevronLeft16 from '../assets/icons/chevron-left-16-16.svg';
import ChevronLeft24 from '../assets/icons/chevron-left-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ChevronLeftIcon = createWebIcon({
  icon: {
    small: ChevronLeft16,
    medium: ChevronLeft24,
  },
  displayName: 'ChevronLeft',
});
