import Eye1Small from '../assets/icons/eye-1-16-16.svg';
import Eye1 from '../assets/icons/eye-1-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function Eye1Icon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <Eye1Small />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Eye1 />
    </Icon>
  );
}
