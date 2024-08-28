import EmailNotificationSmall from '../assets/icons/email-notification-16-16.svg';
import EmailNotification from '../assets/icons/email-notification-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function EmailNotificationIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <EmailNotificationSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <EmailNotification />
    </Icon>
  );
}
