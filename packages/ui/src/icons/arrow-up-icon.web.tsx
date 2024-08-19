import ArrowUpSmall from '../assets/icons/arrow-up-16-16.svg';
import ArrowUp from '../assets/icons/arrow-up-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ArrowUpIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ArrowUpSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ArrowUp />
    </Icon>
  );
}
