import Email16 from '../assets/icons/email-16-16.svg';
import Email24 from '../assets/icons/email-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const EmailIcon = createWebIcon({
  icon: {
    small: Email16,
    medium: Email24,
  },
  displayName: 'Email',
});
