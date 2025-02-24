import Headset16 from '../assets/icons/headset-16-16.svg';
import Headset24 from '../assets/icons/headset-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const HeadsetIcon = createNativeIcon({
  icon: {
    small: Headset16,
    medium: Headset24,
  },
  displayName: 'Headset',
});
