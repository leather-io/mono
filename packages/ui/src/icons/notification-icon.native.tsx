import NotificationSmall from '../assets/icons/notification-small.svg';
import Notification from '../assets/icons/notification.svg';
import { Icon, IconProps } from './icon/icon.native';

export function NotificationIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <NotificationSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Notification />
    </Icon>
  );
}
