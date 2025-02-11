import Exit16 from '../assets/icons/exit-16-16.svg';
import Exit24 from '../assets/icons/exit-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ExitIcon = createNativeIcon({
  icon: {
    small: Exit16,
    medium: Exit24,
  },
  displayName: 'Exit',
});
