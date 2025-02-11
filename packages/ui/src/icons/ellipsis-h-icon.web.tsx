import EllipsisH16 from '../assets/icons/ellipsis-h-16-16.svg';
import EllipsisH24 from '../assets/icons/ellipsis-h-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const EllipsisHIcon = createWebIcon({
  icon: {
    small: EllipsisH16,
    medium: EllipsisH24,
  },
  displayName: 'EllipsisH',
});
