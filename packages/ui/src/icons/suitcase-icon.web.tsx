import Suitcase16 from '../assets/icons/suitcase-16-16.svg';
import Suitcase24 from '../assets/icons/suitcase-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const SuitcaseIcon = createWebIcon({
  icon: {
    small: Suitcase16,
    medium: Suitcase24,
  },
  displayName: 'Suitcase',
});
