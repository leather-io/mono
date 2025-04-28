import Grid16 from '../assets/icons/grid-16-16.svg';
import Grid24 from '../assets/icons/grid-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const GridIcon = createWebIcon({
  icon: {
    small: Grid16,
    medium: Grid24,
  },
  displayName: 'Grid',
});
