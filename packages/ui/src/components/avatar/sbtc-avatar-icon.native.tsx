import SbtcIcon from '../../assets/icons/sbtc.svg';
import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar } from './avatar.native';

export function SbtcAvatarIcon() {
  return (
    <Avatar
      icon={<SbtcIcon width="100%" height="100%" />}
      indicator={<StacksIcon width={16} height={16} />}
    />
  );
}
