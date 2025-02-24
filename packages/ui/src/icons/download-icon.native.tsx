import Download16 from '../assets/icons/download-16-16.svg';
import Download24 from '../assets/icons/download-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const DownloadIcon = createNativeIcon({
  icon: {
    small: Download16,
    medium: Download24,
  },
  displayName: 'Download',
});
