import SbtcIcon from '../../assets/icons/sbtc.svg';
import { Avatar, type AvatarProps } from './avatar.web';

export function SbtcAvatarIcon(props: AvatarProps) {
  return (
    <Avatar
      outlineColor="ink.border-transparent"
      icon={<SbtcIcon width="100%" height="100%" />}
      {...props}
    />
  );
}
