import Checkmark16 from '../assets/icons/checkmark-16-16.svg';
import Checkmark24 from '../assets/icons/checkmark-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const CheckmarkIcon = createWebIcon({
  icon: {
    small: Checkmark16,
    medium: Checkmark24,
  },
  displayName: 'Checkmark',
});
