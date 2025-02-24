import Trash16 from '../assets/icons/trash-16-16.svg';
import Trash24 from '../assets/icons/trash-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const TrashIcon = createWebIcon({
  icon: {
    small: Trash16,
    medium: Trash24,
  },
  displayName: 'Trash',
});
