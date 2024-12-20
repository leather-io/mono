import NoteText16 from '../assets/icons/note-text-16-16.svg';
import NoteText24 from '../assets/icons/note-text-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const NoteTextIcon = createWebIcon({
  icon: {
    small: NoteText16,
    medium: NoteText24,
  },
  displayName: 'NoteText',
});
