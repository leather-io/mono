import WalletSmall from '../assets/icons/users-two-16-16.svg';
import Wallet from '../assets/icons/users-two-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function UsersTwoIcon({ variant, ...props }: IconProps) {
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
