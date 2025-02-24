import Key16 from '../assets/icons/key-16-16.svg';
import Key24 from '../assets/icons/key-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const KeyIcon = createNativeIcon({
  icon: {
    small: Key16,
    medium: Key24,
  },
  displayName: 'Key',
});
