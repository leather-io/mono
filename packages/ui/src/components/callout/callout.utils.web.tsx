import { CheckmarkCircleIcon, ErrorCircleIcon, ErrorIcon, InfoCircleIcon } from '../../icons';

export function getIconVariant(variant?: string) {
  switch (variant) {
    case 'error':
      return <ErrorIcon />;
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
