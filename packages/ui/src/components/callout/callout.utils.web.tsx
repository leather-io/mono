import {
  CheckmarkCircleIcon,
  ErrorCircleIcon,
  ErrorTriangleIcon,
  InfoCircleIcon,
} from '../../icons/index.web';

export function getIconVariant(variant?: string) {
  switch (variant) {
    case 'error':
      return <ErrorTriangleIcon />;
    case 'success':
      return <CheckmarkCircleIcon />;
    case 'warning':
      return <ErrorCircleIcon />;
    case 'info':
      return <InfoCircleIcon />;
    default:
      return undefined;
  }
}
