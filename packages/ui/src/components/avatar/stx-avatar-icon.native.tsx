import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar, AvatarProps } from './avatar.native';

export function StxAvatarIcon(props: AvatarProps) {
  return <Avatar icon={<StacksIcon width="100%" height="100%" />} {...props} />;
}
