import PointerSmall from '../assets/icons/pointer-small.svg';
import Pointer from '../assets/icons/pointer.svg';
import { Icon, IconProps } from './icon/icon.native';

export function PointerIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PointerSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Pointer />
    </Icon>
  );
}
