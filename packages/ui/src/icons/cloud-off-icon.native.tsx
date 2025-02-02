import CloudOff16 from '../assets/icons/cloud-off-16-16.svg';
import CloudOff24 from '../assets/icons/cloud-off-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const CloudOffIcon = createNativeIcon({
  icon: {
    small: CloudOff16,
    medium: CloudOff24,
  },
  displayName: 'CloudOff',
});
