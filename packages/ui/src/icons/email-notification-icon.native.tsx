import EmailNotification16 from '../assets/icons/email-notification-16-16.svg';
import EmailNotification24 from '../assets/icons/email-notification-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const EmailNotificationIcon = createNativeIcon({
  icon: {
    small: EmailNotification16,
    medium: EmailNotification24,
  },
  displayName: 'EmailNotification',
});
