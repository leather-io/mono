import PointerHand16 from '../assets/icons/pointer-hand-16-16.svg';
import PointerHand24 from '../assets/icons/pointer-hand-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PointerHandIcon = createNativeIcon({
  icon: {
    small: PointerHand16,
    medium: PointerHand24,
  },
  displayName: 'PointerHand',
});
