import Backspace16 from '../assets/icons/backspace-16-16.svg';
import Backspace24 from '../assets/icons/backspace-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const BackspaceIcon = createNativeIcon({
  icon: {
    small: Backspace16,
    medium: Backspace24,
  },
  displayName: 'Backspace',
});
