import WalletSmall from '../assets/icons/wallet-small.svg';
import Wallet from '../assets/icons/wallet.svg';
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
