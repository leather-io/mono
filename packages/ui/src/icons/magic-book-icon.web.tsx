import MagicBook16 from '../assets/icons/magic-book-16-16.svg';
import MagicBook24 from '../assets/icons/magic-book-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const MagicBookIcon = createWebIcon({
  icon: {
    small: MagicBook16,
    medium: MagicBook24,
  },
  displayName: 'MagicBook',
});
