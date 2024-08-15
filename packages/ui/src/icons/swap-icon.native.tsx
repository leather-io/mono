import SwapSmall from '../assets/icons/swap-small.svg';
import Swap from '../assets/icons/swap.svg';
import { Icon, IconProps } from './icon/icon.native';

export function SwapIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SwapSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Swap />
    </Icon>
  );
}
