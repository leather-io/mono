import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Avatar } from './avatar.native';

interface BtcAvatarIconProps {
  indicator?: boolean;
}

export function BtcAvatarIcon({ indicator = false }: BtcAvatarIconProps) {
  return (
    <Avatar
      icon={<BtcIcon width="100%" height="100%" />}
      indicator={indicator ? <BtcIcon width={16} height={16} /> : undefined}
    />
  );
}
