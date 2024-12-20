import Passport16 from '../assets/icons/passport-16-16.svg';
import Passport24 from '../assets/icons/passport-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PassportIcon = createWebIcon({
  icon: {
    small: Passport16,
    medium: Passport24,
  },
  displayName: 'Passport',
});
