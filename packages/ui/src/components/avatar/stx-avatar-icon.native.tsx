import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar } from './avatar.native';

export function StxAvatarIcon() {
  return (
    <Avatar
      outlineColor="ink.border-transparent"
      icon={<StacksIcon width="100%" height="100%" />}
    />
  );
}
