import ErrorTriangle16 from '../assets/icons/error-triangle-16-16.svg';
import ErrorTriangle24 from '../assets/icons/error-triangle-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ErrorTriangleIcon = createNativeIcon({
  icon: {
    small: ErrorTriangle16,
    medium: ErrorTriangle24,
  },
  displayName: 'ErrorTriangle',
});
