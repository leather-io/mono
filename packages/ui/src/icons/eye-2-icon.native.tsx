import Eye216 from '../assets/icons/eye-2-16-16.svg';
import Eye224 from '../assets/icons/eye-2-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const Eye2Icon = createNativeIcon({
  icon: {
    small: Eye216,
    medium: Eye224,
  },
  displayName: 'Eye2',
});
