import Eye1ClosedSmall from '../assets/icons/eye-1-closed-16-16.svg';
import Eye1Closed from '../assets/icons/eye-1-closed-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function Eye1ClosedIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <Eye1ClosedSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Eye1Closed />
    </Icon>
  );
}
