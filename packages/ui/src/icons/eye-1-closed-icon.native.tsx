import Eye1Closed16 from '../assets/icons/eye-1-closed-16-16.svg';
import Eye1Closed24 from '../assets/icons/eye-1-closed-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const Eye1ClosedIcon = createNativeIcon({
  icon: {
    small: Eye1Closed16,
    medium: Eye1Closed24,
  },
  displayName: 'Eye1Closed',
});
