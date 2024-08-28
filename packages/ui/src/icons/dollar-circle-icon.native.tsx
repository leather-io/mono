import DollarCircleSmall from '../assets/icons/dollar-circle-16-16.svg';
import DollarCircle from '../assets/icons/dollar-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function DollarCircleIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <DollarCircleSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <DollarCircle />
    </Icon>
  );
}
