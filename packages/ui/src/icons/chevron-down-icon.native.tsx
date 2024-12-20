import ChevronDown16 from '../assets/icons/chevron-down-16-16.svg';
import ChevronDown24 from '../assets/icons/chevron-down-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ChevronDownIcon = createNativeIcon({
  icon: {
    small: ChevronDown16,
    medium: ChevronDown24,
  },
  displayName: 'ChevronDown',
});
