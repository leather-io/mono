import ErrorCircle16 from '../assets/icons/error-circle-16-16.svg';
import ErrorCircle24 from '../assets/icons/error-circle-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ErrorCircleIcon = createNativeIcon({
  icon: {
    small: ErrorCircle16,
    medium: ErrorCircle24,
  },
  displayName: 'ErrorCircle',
});
