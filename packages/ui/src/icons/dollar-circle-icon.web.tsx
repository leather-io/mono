import DollarCircle16 from '../assets/icons/dollar-circle-16-16.svg';
import DollarCircle24 from '../assets/icons/dollar-circle-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const DollarCircleIcon = createWebIcon({
  icon: {
    small: DollarCircle16,
    medium: DollarCircle24,
  },
  displayName: 'DollarCircle',
});
