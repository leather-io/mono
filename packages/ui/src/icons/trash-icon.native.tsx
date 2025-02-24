import Trash16 from '../assets/icons/trash-16-16.svg';
import Trash24 from '../assets/icons/trash-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const TrashIcon = createNativeIcon({
  icon: {
    small: Trash16,
    medium: Trash24,
  },
  displayName: 'Trash',
});
