import Minus16 from '../assets/icons/minus-16-16.svg';
import Minus24 from '../assets/icons/minus-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const MinusIcon = createNativeIcon({
  icon: {
    small: Minus16,
    medium: Minus24,
  },
  displayName: 'Minus',
});
