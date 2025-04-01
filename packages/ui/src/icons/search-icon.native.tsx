import Search16 from '../assets/icons/search-16-16.svg';
import Search24 from '../assets/icons/search-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const SearchIcon = createNativeIcon({
  icon: {
    small: Search16,
    medium: Search24,
  },
  displayName: 'Search',
});
