import PaperPlane16 from '../assets/icons/paper-plane-16-16.svg';
import PaperPlane24 from '../assets/icons/paper-plane-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PaperPlaneIcon = createNativeIcon({
  icon: {
    small: PaperPlane16,
    medium: PaperPlane24,
  },
  displayName: 'PaperPlane',
});
