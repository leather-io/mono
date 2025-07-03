import Sent from '../../assets/icons/activity/sent.svg';
import { createNativeIcon } from '../icon/create-icon.native';

export const SentIcon = createNativeIcon({
  icon: {
    small: Sent,
  },
  displayName: 'SentIcon',
});
