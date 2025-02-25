import Newspaper16 from '../assets/icons/newspaper-16-16.svg';
import Newspaper24 from '../assets/icons/newspaper-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const NewspaperIcon = createWebIcon({
  icon: {
    small: Newspaper16,
    medium: Newspaper24,
  },
  displayName: 'Newspaper',
});
