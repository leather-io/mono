import InfoCircle16 from '../assets/icons/info-circle-16-16.svg';
import InfoCircle24 from '../assets/icons/info-circle-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const InfoCircleIcon = createWebIcon({
  icon: {
    small: InfoCircle16,
    medium: InfoCircle24,
  },
  displayName: 'InfoCircle',
});
