import GlobeTilted16 from '../assets/icons/globe-tilted-16-16.svg';
import GlobeTilted24 from '../assets/icons/globe-tilted-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const GlobeTiltedIcon = createWebIcon({
  icon: {
    small: GlobeTilted16,
    medium: GlobeTilted24,
  },
  displayName: 'GlobeTilted',
});
