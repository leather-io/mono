import Cookie16 from '../assets/icons/cookie-16-16.svg';
import Cookie24 from '../assets/icons/cookie-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const CookieIcon = createNativeIcon({
  icon: {
    small: Cookie16,
    medium: Cookie24,
  },
  displayName: 'Cookie',
});
