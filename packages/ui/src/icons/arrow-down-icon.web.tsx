import ArrowDownSmall from '../assets/icons/arrow-down-16-16.svg';
import ArrowDown from '../assets/icons/arrow-down-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ArrowDownIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ArrowDownSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ArrowDown />
    </Icon>
  );
}
