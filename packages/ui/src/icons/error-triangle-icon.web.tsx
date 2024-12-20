import ErrorTriangle16 from '../assets/icons/error-triangle-16-16.svg';
import ErrorTriangle24 from '../assets/icons/error-triangle-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ErrorTriangleIcon = createWebIcon({
  icon: {
    small: ErrorTriangle16,
    medium: ErrorTriangle24,
  },
  displayName: 'ErrorTriangle',
});
