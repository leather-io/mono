import Grid16 from '../assets/icons/grid-16-16.svg';
import Grid24 from '../assets/icons/grid-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const GridIcon = createNativeIcon({
  icon: {
    small: Grid16,
    medium: Grid24,
  },
  displayName: 'Grid',
});
