import Pulse16 from '../assets/icons/pulse-16-16.svg';
import Pulse24 from '../assets/icons/pulse-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PulseIcon = createNativeIcon({
  icon: {
    small: Pulse16,
    medium: Pulse24,
  },
  displayName: 'Pulse',
});
