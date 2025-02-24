import Passport16 from '../assets/icons/passport-16-16.svg';
import Passport24 from '../assets/icons/passport-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PassportIcon = createNativeIcon({
  icon: {
    small: Passport16,
    medium: Passport24,
  },
  displayName: 'Passport',
});
