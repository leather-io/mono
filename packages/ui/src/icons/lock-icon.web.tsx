import LockSmall from '../assets/icons/lock-16-16.svg';
import Lock from '../assets/icons/lock-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

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
