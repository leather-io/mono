import Plus16 from '../assets/icons/plus-16-16.svg';
import Plus24 from '../assets/icons/plus-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PlusIcon = createWebIcon({
  icon: {
    small: Plus16,
    medium: Plus24,
  },
  displayName: 'Plus',
});
