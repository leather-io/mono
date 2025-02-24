import Expand16 from '../assets/icons/expand-16-16.svg';
import Expand24 from '../assets/icons/expand-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ExpandIcon = createWebIcon({
  icon: {
    small: Expand16,
    medium: Expand24,
  },
  displayName: 'Expand',
});
