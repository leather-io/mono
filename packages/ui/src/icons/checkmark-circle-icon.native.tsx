import CheckmarkCircleSmall from '../assets/icons/checkmark-circle-small.svg';
import CheckmarkCircle from '../assets/icons/checkmark-circle.svg';
import { Icon, IconProps } from './icon/icon.native';

export function CheckmarkCircleIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CheckmarkCircleSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <CheckmarkCircle />
    </Icon>
  );
}
