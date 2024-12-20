import Zap16 from '../assets/icons/zap-16-16.svg';
import Zap24 from '../assets/icons/zap-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ZapIcon = createNativeIcon({
  icon: {
    small: Zap16,
    medium: Zap24,
  },
  displayName: 'Zap',
});
