import Bitcoin16 from '../assets/icons/bitcoin-16-16.svg';
import Bitcoin24 from '../assets/icons/bitcoin-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const BitcoinIcon = createWebIcon({
  icon: {
    small: Bitcoin16,
    medium: Bitcoin24,
  },
  displayName: 'Bitcoin',
});
