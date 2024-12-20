import Expand16 from '../assets/icons/expand-16-16.svg';
import Expand24 from '../assets/icons/expand-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ExpandIcon = createNativeIcon({
  icon: {
    small: Expand16,
    medium: Expand24,
  },
  displayName: 'Expand',
});
