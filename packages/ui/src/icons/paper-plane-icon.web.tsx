import PaperPlane16 from '../assets/icons/paper-plane-16-16.svg';
import PaperPlane24 from '../assets/icons/paper-plane-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PaperPlaneIcon = createWebIcon({
  icon: {
    small: PaperPlane16,
    medium: PaperPlane24,
  },
  displayName: 'PaperPlane',
});
