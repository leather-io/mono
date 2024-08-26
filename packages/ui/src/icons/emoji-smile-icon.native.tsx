import EmojiSmile from '../assets/icons/emoji-smile.svg';
import { Icon, IconProps } from './icon/icon.native';

export function EmojiSmileIcon({ variant, ...props }: IconProps) {
  // TODO: Need svg for small variant
  return (
    <Icon {...props}>
      <EmojiSmile />
    </Icon>
  );
}
