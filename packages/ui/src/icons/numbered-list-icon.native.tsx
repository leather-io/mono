import NumberedList16 from '../assets/icons/numbered-list-16-16.svg';
import NumberedList24 from '../assets/icons/numbered-list-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const NumberedListIcon = createNativeIcon({
  icon: {
    small: NumberedList16,
    medium: NumberedList24,
  },
  displayName: 'NumberedList',
});
