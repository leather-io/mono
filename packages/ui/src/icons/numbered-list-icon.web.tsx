import NumberedList16 from '../assets/icons/numbered-list-16-16.svg';
import NumberedList24 from '../assets/icons/numbered-list-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const NumberedListIcon = createWebIcon({
  icon: {
    small: NumberedList16,
    medium: NumberedList24,
  },
  displayName: 'NumberedList',
});
