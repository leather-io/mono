import Placeholder16 from '../assets/icons/placeholder-16-16.svg';
import Placeholder24 from '../assets/icons/placeholder-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PlaceholderIcon = createNativeIcon({
  icon: {
    small: Placeholder16,
    medium: Placeholder24,
  },
  displayName: 'Placeholder',
});
