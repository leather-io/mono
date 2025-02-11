import Headset16 from '../assets/icons/headset-16-16.svg';
import Headset24 from '../assets/icons/headset-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const HeadsetIcon = createWebIcon({
  icon: {
    small: Headset16,
    medium: Headset24,
  },
  displayName: 'Headset',
});
