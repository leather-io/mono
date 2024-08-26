import LockSmall from '../assets/icons/lock-small.svg';
import Lock from '../assets/icons/lock.svg';
import { Icon, IconProps } from './icon/icon.native';

export function LockIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <LockSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Lock />
    </Icon>
  );
}
