import EmailNotification16 from '../assets/icons/email-notification-16-16.svg';
import EmailNotification24 from '../assets/icons/email-notification-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const EmailNotificationIcon = createWebIcon({
  icon: {
    small: EmailNotification16,
    medium: EmailNotification24,
  },
  displayName: 'EmailNotification',
});
