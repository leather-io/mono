import ArrowsRepeatLeftRight16 from '../assets/icons/arrows-repeat-left-right-16-16.svg';
import ArrowsRepeatLeftRight24 from '../assets/icons/arrows-repeat-left-right-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowsRepeatLeftRightIcon = createNativeIcon({
  icon: {
    small: ArrowsRepeatLeftRight16,
    medium: ArrowsRepeatLeftRight24,
  },
  displayName: 'ArrowsRepeatLeftRight',
});
