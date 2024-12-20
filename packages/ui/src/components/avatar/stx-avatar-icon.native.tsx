import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar } from './avatar.native';

export function StxAvatarIcon() {
  return (
    <Avatar bg="ink.background-primary" p="0">
      <StacksIcon width={40} height={40} />
    </Avatar>
  );
}
