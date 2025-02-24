import ErrorCircle16 from '../assets/icons/error-circle-16-16.svg';
import ErrorCircle24 from '../assets/icons/error-circle-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ErrorCircleIcon = createWebIcon({
  icon: {
    small: ErrorCircle16,
    medium: ErrorCircle24,
  },
  displayName: 'ErrorCircle',
});
