import EyeSmall from '../assets/icons/eye-small.svg';
import Eye from '../assets/icons/eye.svg';
import { Icon, IconProps } from './icon/icon.native';

export function EyeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <EyeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Eye />
    </Icon>
  );
}
