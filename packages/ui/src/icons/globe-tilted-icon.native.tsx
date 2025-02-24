import GlobeTilted16 from '../assets/icons/globe-tilted-16-16.svg';
import GlobeTilted24 from '../assets/icons/globe-tilted-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const GlobeTiltedIcon = createNativeIcon({
  icon: {
    small: GlobeTilted16,
    medium: GlobeTilted24,
  },
  displayName: 'GlobeTilted',
});
