import Failed from '../../assets/icons/activity/failed.svg';
import { createWebIcon } from '../icon/create-icon.web';

export const FailedIcon = createWebIcon({
  icon: {
    large: Failed,
  },
  defaultVariant: 'large',
  displayName: 'FailedIcon',
});
