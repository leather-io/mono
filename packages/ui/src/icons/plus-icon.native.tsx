import PlusSmall from '../assets/icons/plus-small.svg';
import Plus from '../assets/icons/plus.svg';
import { Icon, IconProps } from './icon/icon.native';

export function PlusIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PlusSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Plus />
    </Icon>
  );
}
