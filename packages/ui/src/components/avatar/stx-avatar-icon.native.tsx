import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar } from './avatar.native';

interface StxAvatarIconProps {
  indicator?: boolean;
}

export function StxAvatarIcon({ indicator = false }: StxAvatarIconProps) {
  return (
    <Avatar
      icon={<StacksIcon width="100%" height="100%" />}
      indicator={indicator ? <StacksIcon width={16} height={16} /> : undefined}
    />
  );
}
