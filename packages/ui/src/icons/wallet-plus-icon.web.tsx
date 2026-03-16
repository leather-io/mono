import WalletPlus16 from '../assets/icons/wallet-plus-16-16.svg';
import WalletPlus24 from '../assets/icons/wallet-plus-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const WalletPlusIcon = createWebIcon({
  icon: {
    small: WalletPlus16,
    medium: WalletPlus24,
  },
  displayName: 'WalletPlus',
});
