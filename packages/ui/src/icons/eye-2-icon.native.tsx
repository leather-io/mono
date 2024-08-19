import Eye2Small from '../assets/icons/eye-2-16-16.svg';
import Eye2 from '../assets/icons/eye-2-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function Eye2Icon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <Eye2Small />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Eye2 />
    </Icon>
  );
}
