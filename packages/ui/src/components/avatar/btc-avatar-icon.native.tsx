import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Avatar, type AvatarProps } from './avatar.native';

export function BtcAvatarIcon(props: AvatarProps) {
  return <Avatar icon={<BtcIcon width="100%" height="100%" />} {...props} />;
}
