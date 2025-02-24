import Zap16 from '../assets/icons/zap-16-16.svg';
import Zap24 from '../assets/icons/zap-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ZapIcon = createWebIcon({
  icon: {
    small: Zap16,
    medium: Zap24,
  },
  displayName: 'Zap',
});
