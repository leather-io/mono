import ChevronDownSmall from '../assets/icons/chevron-down-small.svg';
import ChevronDown from '../assets/icons/chevron-down.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ChevronDownIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ChevronDownSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ChevronDown />
    </Icon>
  );
}
