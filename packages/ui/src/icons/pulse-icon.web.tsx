import Pulse16 from '../assets/icons/pulse-16-16.svg';
import Pulse24 from '../assets/icons/pulse-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PulseIcon = createWebIcon({
  icon: {
    small: Pulse16,
    medium: Pulse24,
  },
  displayName: 'Pulse',
});
