import SquareNotificationSmall from '../assets/icons/square-notification-16-16.svg';
import SquareNotification from '../assets/icons/square-notification-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function SquareNotificationIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SquareNotificationSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <SquareNotification />
    </Icon>
  );
}
