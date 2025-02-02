import PointerHand16 from '../assets/icons/pointer-hand-16-16.svg';
import PointerHand24 from '../assets/icons/pointer-hand-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PointerHandIcon = createWebIcon({
  icon: {
    small: PointerHand16,
    medium: PointerHand24,
  },
  displayName: 'PointerHand',
});
