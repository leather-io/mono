import SquareNotification16 from '../assets/icons/square-notification-16-16.svg';
import SquareNotification24 from '../assets/icons/square-notification-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const SquareNotificationIcon = createWebIcon({
  icon: {
    small: SquareNotification16,
    medium: SquareNotification24,
  },
  displayName: 'SquareNotification',
});
