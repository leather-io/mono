import ArrowLeft16 from '../assets/icons/arrow-left-16-16.svg';
import ArrowLeft24 from '../assets/icons/arrow-left-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ArrowLeftIcon = createNativeIcon({
  icon: {
    small: ArrowLeft16,
    medium: ArrowLeft24,
  },
  displayName: 'ArrowLeft',
});
