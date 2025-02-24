import ArrowLeft16 from '../assets/icons/arrow-left-16-16.svg';
import ArrowLeft24 from '../assets/icons/arrow-left-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ArrowLeftIcon = createWebIcon({
  icon: {
    small: ArrowLeft16,
    medium: ArrowLeft24,
  },
  displayName: 'ArrowLeft',
});
