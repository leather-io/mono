import BellSmall from '../assets/icons/bell-16-16.svg';
import Bell from '../assets/icons/bell-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function BellIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <BellSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Bell />
    </Icon>
  );
}
