import ChevronDownSmall from '../assets/icons/chevron-down-16-16.svg';
import ChevronDown from '../assets/icons/chevron-down-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

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
