import SbtcIcon from '../../assets/icons/sbtc.svg';
import { Avatar, type AvatarProps } from './avatar.native';

export function SbtcAvatarIcon(props: AvatarProps) {
  return <Avatar icon={<SbtcIcon width="100%" height="100%" />} {...props} />;
}
