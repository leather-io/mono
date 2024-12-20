import Email16 from '../assets/icons/email-16-16.svg';
import Email24 from '../assets/icons/email-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const EmailIcon = createNativeIcon({
  icon: {
    small: Email16,
    medium: Email24,
  },
  displayName: 'Email',
});
