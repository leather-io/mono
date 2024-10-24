import WalletPlusSmall from '../assets/icons/wallet-plus-16-16.svg';
import WalletPlus from '../assets/icons/wallet-plus-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function WalletPlusIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <WalletPlusSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <WalletPlus />
    </Icon>
  );
}
