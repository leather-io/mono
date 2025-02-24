import Eye1Closed16 from '../assets/icons/eye-1-closed-16-16.svg';
import Eye1Closed24 from '../assets/icons/eye-1-closed-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const Eye1ClosedIcon = createWebIcon({
  icon: {
    small: Eye1Closed16,
    medium: Eye1Closed24,
  },
  displayName: 'Eye1Closed',
});
