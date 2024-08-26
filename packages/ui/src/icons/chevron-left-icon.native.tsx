import ChevronLeftSmall from '../assets/icons/chevron-left-small.svg';
import ChevronLeft from '../assets/icons/chevron-left.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ChevronLeftIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ChevronLeftSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ChevronLeft />
    </Icon>
  );
}
