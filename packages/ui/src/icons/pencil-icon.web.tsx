import Pencil16 from '../assets/icons/pencil-16-16.svg';
import Pencil24 from '../assets/icons/pencil-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PencilIcon = createWebIcon({
  icon: {
    small: Pencil16,
    medium: Pencil24,
  },
  displayName: 'Pencil',
});
