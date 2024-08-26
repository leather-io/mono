import ChevronUpSmall from '../assets/icons/chevron-up-small.svg';
import ChevronUp from '../assets/icons/chevron-up.svg';
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
