import Cancelled from '../../assets/icons/activity/cancelled.svg';
import { createWebIcon } from '../icon/create-icon.web';

export const CancelledIcon = createWebIcon({
  icon: {
    large: Cancelled,
  },
  defaultVariant: 'large',
  displayName: 'CancelledIcon',
});
