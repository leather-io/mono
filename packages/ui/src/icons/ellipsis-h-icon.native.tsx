import EllipsisH16 from '../assets/icons/ellipsis-h-16-16.svg';
import EllipsisH24 from '../assets/icons/ellipsis-h-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const EllipsisHIcon = createNativeIcon({
  icon: {
    small: EllipsisH16,
    medium: EllipsisH24,
  },
  displayName: 'EllipsisH',
});
