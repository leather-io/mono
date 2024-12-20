import EllipsisV16 from '../assets/icons/ellipsis-v-16-16.svg';
import EllipsisV24 from '../assets/icons/ellipsis-v-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const EllipsisVIcon = createNativeIcon({
  icon: {
    small: EllipsisV16,
    medium: EllipsisV24,
  },
  displayName: 'EllipsisV',
});
