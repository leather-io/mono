import MagicBook16 from '../assets/icons/magic-book-16-16.svg';
import MagicBook24 from '../assets/icons/magic-book-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const MagicBookIcon = createNativeIcon({
  icon: {
    small: MagicBook16,
    medium: MagicBook24,
  },
  displayName: 'MagicBook',
});
