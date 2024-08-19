import ChevronUpSmall from '../assets/icons/chevron-up-16-16.svg';
import ChevronUp from '../assets/icons/chevron-up-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ChevronUpIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ChevronUpSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ChevronUp />
    </Icon>
  );
}
