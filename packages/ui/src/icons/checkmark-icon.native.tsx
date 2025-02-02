import Checkmark16 from '../assets/icons/checkmark-16-16.svg';
import Checkmark24 from '../assets/icons/checkmark-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const CheckmarkIcon = createNativeIcon({
  icon: {
    small: Checkmark16,
    medium: Checkmark24,
  },
  displayName: 'Checkmark',
});
