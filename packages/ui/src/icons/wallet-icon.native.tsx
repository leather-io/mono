import WalletSmall from '../assets/icons/wallet-16-16.svg';
import Wallet from '../assets/icons/wallet-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function WalletIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <WalletSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Wallet />
    </Icon>
  );
}
