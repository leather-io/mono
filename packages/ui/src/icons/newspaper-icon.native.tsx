import Newspaper16 from '../assets/icons/newspaper-16-16.svg';
import Newspaper24 from '../assets/icons/newspaper-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const NewspaperIcon = createNativeIcon({
  icon: {
    small: Newspaper16,
    medium: Newspaper24,
  },
  displayName: 'Newspaper',
});
