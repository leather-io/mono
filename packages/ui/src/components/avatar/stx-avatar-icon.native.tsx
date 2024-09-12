import StacksIcon from '../../assets/icons/stacks.svg';
import { Icon } from '../../icons/icon/icon.native';
import { Avatar } from './avatar.native';

export function StxAvatarIcon() {
  return (
    <Avatar bg="ink.background-primary">
      <Icon>
        <StacksIcon width={40} height={40} />
      </Icon>
    </Avatar>
  );
}
