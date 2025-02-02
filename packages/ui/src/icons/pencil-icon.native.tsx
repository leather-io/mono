import Pencil16 from '../assets/icons/pencil-16-16.svg';
import Pencil24 from '../assets/icons/pencil-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PencilIcon = createNativeIcon({
  icon: {
    small: Pencil16,
    medium: Pencil24,
  },
  displayName: 'Pencil',
});
