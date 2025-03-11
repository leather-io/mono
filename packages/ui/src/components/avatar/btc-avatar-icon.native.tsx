import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Avatar } from './avatar.native';

export function BtcAvatarIcon() {
  return (
    <Avatar
      icon={<BtcIcon width="100%" height="100%" />}
      indicator={<BtcIcon width={16} height={16} />}
    />
  );
}
