import NoteEmptySmall from '../assets/icons/note-empty-16-16.svg';
import NoteEmpty from '../assets/icons/note-empty-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function NoteEmptyIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <NoteEmptySmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <NoteEmpty />
    </Icon>
  );
}
