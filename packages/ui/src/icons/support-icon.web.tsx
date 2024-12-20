import Support16 from '../assets/icons/support-16-16.svg';
import Support24 from '../assets/icons/support-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const SupportIcon = createWebIcon({
  icon: {
    small: Support16,
    medium: Support24,
  },
  displayName: 'Support',
});
