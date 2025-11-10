import Ordinal16 from '../assets/icons/ordinal-16-16.svg';
import Ordinal24 from '../assets/icons/ordinal-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const OrdinalIcon = createNativeIcon({
  icon: {
    small: Ordinal16,
    medium: Ordinal24,
  },
  displayName: 'Ordinal',
});
