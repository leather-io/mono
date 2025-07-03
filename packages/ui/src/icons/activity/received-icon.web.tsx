import Received from '../../assets/icons/activity/received.svg';
import { createWebIcon } from '../icon/create-icon.web';

export const ReceivedIcon = createWebIcon({
  icon: {
    large: Received,
  },
  defaultVariant: 'large',
  displayName: 'ReceivedIcon',
});
