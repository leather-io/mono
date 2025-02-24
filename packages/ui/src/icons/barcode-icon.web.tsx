import Barcode16 from '../assets/icons/barcode-16-16.svg';
import Barcode24 from '../assets/icons/barcode-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const BarcodeIcon = createWebIcon({
  icon: {
    small: Barcode16,
    medium: Barcode24,
  },
  displayName: 'Barcode',
});
