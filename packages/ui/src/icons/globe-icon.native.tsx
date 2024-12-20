import Globe16 from '../assets/icons/globe-16-16.svg';
import Globe24 from '../assets/icons/globe-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const GlobeIcon = createNativeIcon({
  icon: {
    small: Globe16,
    medium: Globe24,
  },
  displayName: 'Globe',
});
