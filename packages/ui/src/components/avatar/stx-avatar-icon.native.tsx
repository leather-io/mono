import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar, AvatarProps } from './avatar.native';

interface StxAvatarIconProps extends Omit<AvatarProps, 'indicator'> {
  indicator?: boolean;
}

export function StxAvatarIcon({ indicator = false, ...props }: StxAvatarIconProps) {
  return (
    <Avatar
      icon={<StacksIcon width="100%" height="100%" />}
      indicator={indicator ? <StacksIcon width={16} height={16} /> : undefined}
      {...props}
    />
  );
}
