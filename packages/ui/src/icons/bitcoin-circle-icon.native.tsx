import BitcoinCircle16 from '../assets/icons/bitcoin-circle-16-16.svg';
import BitcoinCircle24 from '../assets/icons/bitcoin-circle-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const BitcoinCircleIcon = createNativeIcon({
  icon: {
    small: BitcoinCircle16,
    medium: BitcoinCircle24,
  },
  displayName: 'BitcoinCircle',
});
