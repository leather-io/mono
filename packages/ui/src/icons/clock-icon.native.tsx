import Clock24 from '../assets/icons/clock-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ClockIcon = createNativeIcon({
  icon: {
    medium: Clock24,
  },
  displayName: 'Clock',
});
