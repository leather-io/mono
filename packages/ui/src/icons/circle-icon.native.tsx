import Circle16 from '../assets/icons/circle-16-16.svg';
import Circle24 from '../assets/icons/circle-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const CircleIcon = createNativeIcon({
  icon: {
    small: Circle16,
    medium: Circle24,
  },
  displayName: 'Circle',
});
