import Pending from '../../assets/icons/activity/pending.svg';
import { createWebIcon } from '../icon/create-icon.web';

export const PendingIcon = createWebIcon({
  icon: {
    large: Pending,
  },
  defaultVariant: 'large',
  displayName: 'PendingIcon',
});
