import BitcoinCircleSmall from '../assets/icons/bitcoin-circle-16-16.svg';
import BitcoinCircle from '../assets/icons/bitcoin-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function BitcoinCircleIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <BitcoinCircleSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <BitcoinCircle />
    </Icon>
  );
}
