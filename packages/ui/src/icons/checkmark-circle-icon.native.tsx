import CheckmarkCircleSmall from '../assets/icons/checkmark-circle-16-16.svg';
import CheckmarkCircle from '../assets/icons/checkmark-circle-24-24.svg';
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
