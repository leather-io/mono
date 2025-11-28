import AppIcon16 from '../assets/icons/app-icon-16-16.svg';
import AppIcon24 from '../assets/icons/app-icon-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const AppIcon = createWebIcon({
  icon: {
    small: AppIcon16,
    medium: AppIcon24,
  },
  displayName: 'AppIcon',
});
