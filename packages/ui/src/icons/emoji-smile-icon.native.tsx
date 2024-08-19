import EmojiSmile from '../assets/icons/emoji-smile.svg';
import { Icon, IconProps } from './icon/icon.native';

// TODO: This should be an AvatarIcon once that component is made for mobile:
// https://github.com/leather-io/extension/issues/5805
export function EmojiSmileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <EmojiSmile />
    </Icon>
  );
}
