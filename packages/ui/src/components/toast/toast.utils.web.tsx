import { CheckmarkCircleIcon, ErrorTriangleIcon, InfoCircleIcon } from '../../icons/index.web';
import type { ToastVariant } from './toast.web';

export function getIconVariant(variant?: ToastVariant) {
  switch (variant) {
    case 'info':
      return <InfoCircleIcon color="ink.ink.background-primary" />;
    case 'success':
      return <CheckmarkCircleIcon color="green.action-primary-default" />;
    case 'error':
      return <ErrorTriangleIcon color="red.action-primary-default" />;
    default:
      return <InfoCircleIcon color="ink.ink.background-primary" />;
  }
}
