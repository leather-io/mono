import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Avatar, AvatarProps } from './avatar.web';

export function BtcAvatarIcon(props: AvatarProps) {
  return (
    <Avatar
      outlineColor="ink.border-transparent"
      icon={<BtcIcon width="100%" height="100%" />}
      {...props}
    />
  );
}
