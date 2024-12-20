import SunInCloud16 from '../assets/icons/sun-in-cloud-16-16.svg';
import SunInCloud24 from '../assets/icons/sun-in-cloud-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const SunInCloudIcon = createNativeIcon({
  icon: {
    small: SunInCloud16,
    medium: SunInCloud24,
  },
  displayName: 'SunInCloud',
});
