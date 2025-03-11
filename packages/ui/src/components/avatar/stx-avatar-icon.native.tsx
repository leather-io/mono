import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar } from './avatar.native';

export function StxAvatarIcon() {
  return (
    <Avatar
      icon={<StacksIcon width="100%" height="100%" />}
      indicator={<StacksIcon width={16} height={16} />}
    />
  );
}
