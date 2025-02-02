import NoteEmpty16 from '../assets/icons/note-empty-16-16.svg';
import NoteEmpty24 from '../assets/icons/note-empty-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const NoteEmptyIcon = createNativeIcon({
  icon: {
    small: NoteEmpty16,
    medium: NoteEmpty24,
  },
  displayName: 'NoteEmpty',
});
