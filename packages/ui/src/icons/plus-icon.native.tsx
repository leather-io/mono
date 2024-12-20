import Plus16 from '../assets/icons/plus-16-16.svg';
import Plus24 from '../assets/icons/plus-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PlusIcon = createNativeIcon({
  icon: {
    small: Plus16,
    medium: Plus24,
  },
  displayName: 'Plus',
});
