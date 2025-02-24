import GraduateCap16 from '../assets/icons/graduate-cap-16-16.svg';
import GraduateCap24 from '../assets/icons/graduate-cap-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const GraduateCapIcon = createNativeIcon({
  icon: {
    small: GraduateCap16,
    medium: GraduateCap24,
  },
  displayName: 'GraduateCap',
});
