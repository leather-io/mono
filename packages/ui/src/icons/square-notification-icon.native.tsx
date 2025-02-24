import SquareNotification16 from '../assets/icons/square-notification-16-16.svg';
import SquareNotification24 from '../assets/icons/square-notification-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const SquareNotificationIcon = createNativeIcon({
  icon: {
    small: SquareNotification16,
    medium: SquareNotification24,
  },
  displayName: 'SquareNotification',
});
