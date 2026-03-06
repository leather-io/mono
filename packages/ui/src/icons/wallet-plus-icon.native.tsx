import WalletPlus16 from '../assets/icons/wallet-plus-16-16.svg';
import WalletPlus24 from '../assets/icons/wallet-plus-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const WalletPlusIcon = createNativeIcon({
  icon: {
    small: WalletPlus16,
    medium: WalletPlus24,
  },
  displayName: 'WalletPlus',
});
