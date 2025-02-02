import Cookie16 from '../assets/icons/cookie-16-16.svg';
import Cookie24 from '../assets/icons/cookie-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const CookieIcon = createWebIcon({
  icon: {
    small: Cookie16,
    medium: Cookie24,
  },
  displayName: 'Cookie',
});
