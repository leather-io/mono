import Star16 from '../assets/icons/star-16-16.svg';
import Star24 from '../assets/icons/star-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const StarIcon = createNativeIcon({
  icon: {
    small: Star16,
    medium: Star24,
  },
  displayName: 'Star',
});
