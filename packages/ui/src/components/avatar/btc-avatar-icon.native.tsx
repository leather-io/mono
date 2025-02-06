import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Avatar } from './avatar.native';

export function BtcAvatarIcon() {
  return (
    <Avatar outlineColor="ink.border-transparent" icon={<BtcIcon width="100%" height="100%" />} />
  );
}
