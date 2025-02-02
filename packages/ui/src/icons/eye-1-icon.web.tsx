import Eye116 from '../assets/icons/eye-1-16-16.svg';
import Eye124 from '../assets/icons/eye-1-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const Eye1Icon = createWebIcon({
  icon: {
    small: Eye116,
    medium: Eye124,
  },
  displayName: 'Eye1',
});
