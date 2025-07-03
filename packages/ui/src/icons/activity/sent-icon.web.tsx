import Sent from '../../assets/icons/activity/sent.svg';
import { createWebIcon } from '../icon/create-icon.web';

export const SentIcon = createWebIcon({
  icon: {
    large: Sent,
  },
  defaultVariant: 'large',
  displayName: 'SentIcon',
});
