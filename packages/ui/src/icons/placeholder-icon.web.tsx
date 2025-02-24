import Placeholder16 from '../assets/icons/placeholder-16-16.svg';
import Placeholder24 from '../assets/icons/placeholder-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PlaceholderIcon = createWebIcon({
  icon: {
    small: Placeholder16,
    medium: Placeholder24,
  },
  displayName: 'Placeholder',
});
