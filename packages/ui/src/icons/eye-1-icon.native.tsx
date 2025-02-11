import Eye116 from '../assets/icons/eye-1-16-16.svg';
import Eye124 from '../assets/icons/eye-1-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const Eye1Icon = createNativeIcon({
  icon: {
    small: Eye116,
    medium: Eye124,
  },
  displayName: 'Eye1',
});
