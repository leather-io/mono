import PointerHandSmall from '../assets/icons/pointer-hand-16-16.svg';
import PointerHand from '../assets/icons/pointer-hand-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function PointerHandIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PointerHandSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <PointerHand />
    </Icon>
  );
}
