import Barcode16 from '../assets/icons/barcode-16-16.svg';
import Barcode24 from '../assets/icons/barcode-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const BarcodeIcon = createNativeIcon({
  icon: {
    small: Barcode16,
    medium: Barcode24,
  },
  displayName: 'Barcode',
});
