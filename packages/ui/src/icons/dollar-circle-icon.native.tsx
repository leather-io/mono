import DollarCircle16 from '../assets/icons/dollar-circle-16-16.svg';
import DollarCircle24 from '../assets/icons/dollar-circle-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const DollarCircleIcon = createNativeIcon({
  icon: {
    small: DollarCircle16,
    medium: DollarCircle24,
  },
  displayName: 'DollarCircle',
});
