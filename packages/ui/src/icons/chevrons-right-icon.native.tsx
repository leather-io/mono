import ChevronsRight16 from '../assets/icons/chevrons-right-16-16.svg';
import ChevronsRight24 from '../assets/icons/chevrons-right-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ChevronsRightIcon = createNativeIcon({
  icon: {
    small: ChevronsRight16,
    medium: ChevronsRight24,
  },
  displayName: 'ChevronsRight',
});
