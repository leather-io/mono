import ChevronRightSmall from '../assets/icons/chevron-right-16-16.svg';
import ChevronRight from '../assets/icons/chevron-right-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

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
