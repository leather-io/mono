import House16 from '../assets/icons/house-16-16.svg';
import House24 from '../assets/icons/house-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const HouseIcon = createNativeIcon({
  icon: {
    small: House16,
    medium: House24,
  },
  displayName: 'House',
});
