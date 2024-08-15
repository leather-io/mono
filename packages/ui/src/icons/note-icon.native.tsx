import NoteSmall from '../assets/icons/note-small.svg';
import Note from '../assets/icons/note.svg';
import { Icon, IconProps } from './icon/icon.native';

export function NoteIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <NoteSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Note />
    </Icon>
  );
}
