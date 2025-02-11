import Wallet16 from '../assets/icons/wallet-16-16.svg';
import Wallet24 from '../assets/icons/wallet-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const WalletIcon = createNativeIcon({
  icon: {
    small: Wallet16,
    medium: Wallet24,
  },
  displayName: 'Wallet',
});
