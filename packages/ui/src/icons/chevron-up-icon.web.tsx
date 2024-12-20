import ChevronUp16 from '../assets/icons/chevron-up-16-16.svg';
import ChevronUp24 from '../assets/icons/chevron-up-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ChevronUpIcon = createWebIcon({
  icon: {
    small: ChevronUp16,
    medium: ChevronUp24,
  },
  displayName: 'ChevronUp',
});
