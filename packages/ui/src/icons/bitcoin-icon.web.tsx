import BitcoinSmall from '../assets/icons/bitcoin-16-16.svg';
import Bitcoin from '../assets/icons/bitcoin-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function BitcoinIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <BitcoinSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Bitcoin />
    </Icon>
  );
}
