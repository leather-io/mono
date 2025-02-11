import Exit16 from '../assets/icons/exit-16-16.svg';
import Exit24 from '../assets/icons/exit-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ExitIcon = createWebIcon({
  icon: {
    small: Exit16,
    medium: Exit24,
  },
  displayName: 'Exit',
});
