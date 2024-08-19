import ChevronLeftSmall from '../assets/icons/chevron-left-16-16.svg';
import ChevronLeft from '../assets/icons/chevron-left-24-24.svg';
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
