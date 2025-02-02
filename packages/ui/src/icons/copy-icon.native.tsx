import Copy16 from '../assets/icons/copy-16-16.svg';
import Copy24 from '../assets/icons/copy-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const CopyIcon = createNativeIcon({
  icon: {
    small: Copy16,
    medium: Copy24,
  },
  displayName: 'Copy',
});
