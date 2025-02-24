import CheckmarkCircle16 from '../assets/icons/checkmark-circle-16-16.svg';
import CheckmarkCircle24 from '../assets/icons/checkmark-circle-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const CheckmarkCircleIcon = createWebIcon({
  icon: {
    small: CheckmarkCircle16,
    medium: CheckmarkCircle24,
  },
  displayName: 'CheckmarkCircle',
});
