import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar, type AvatarProps } from './avatar.web';

export function StxAvatarIcon(props: AvatarProps) {
  return (
    <Avatar
      outlineColor="ink.border-transparent"
      icon={<StacksIcon width="100%" height="100%" />}
      {...props}
    />
  );
}
