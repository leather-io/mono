import SquareLinesBottom16 from '../assets/icons/square-lines-bottom-16-16.svg';
import SquareLinesBottom24 from '../assets/icons/square-lines-bottom-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const SquareLinesBottomIcon = createNativeIcon({
  icon: {
    small: SquareLinesBottom16,
    medium: SquareLinesBottom24,
  },
  displayName: 'SquareLinesBottom',
});
