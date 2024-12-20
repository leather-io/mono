import Globe16 from '../assets/icons/globe-16-16.svg';
import Globe24 from '../assets/icons/globe-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const GlobeIcon = createWebIcon({
  icon: {
    small: Globe16,
    medium: Globe24,
  },
  displayName: 'Globe',
});
