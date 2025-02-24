import Support16 from '../assets/icons/support-16-16.svg';
import Support24 from '../assets/icons/support-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const SupportIcon = createNativeIcon({
  icon: {
    small: Support16,
    medium: Support24,
  },
  displayName: 'Support',
});
