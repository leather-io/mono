import NoteEmpty16 from '../assets/icons/note-empty-16-16.svg';
import NoteEmpty24 from '../assets/icons/note-empty-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const NoteEmptyIcon = createWebIcon({
  icon: {
    small: NoteEmpty16,
    medium: NoteEmpty24,
  },
  displayName: 'NoteEmpty',
});
