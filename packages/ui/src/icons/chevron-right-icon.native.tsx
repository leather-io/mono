import ChevronRightSmall from '../assets/icons/chevron-right-small.svg';
import ChevronRight from '../assets/icons/chevron-right.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ChevronRightIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ChevronRightSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ChevronRight />
    </Icon>
  );
}
