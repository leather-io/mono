import Keyhole16 from '../assets/icons/keyhole-16-16.svg';
import Keyhole24 from '../assets/icons/keyhole-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const KeyholeIcon = createNativeIcon({
  icon: {
    small: Keyhole16,
    medium: Keyhole24,
  },
  displayName: 'Keyhole',
});
