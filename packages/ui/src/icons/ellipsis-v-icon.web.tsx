import EllipsisV16 from '../assets/icons/ellipsis-v-16-16.svg';
import EllipsisV24 from '../assets/icons/ellipsis-v-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const EllipsisVIcon = createWebIcon({
  icon: {
    small: EllipsisV16,
    medium: EllipsisV24,
  },
  displayName: 'EllipsisV',
});
