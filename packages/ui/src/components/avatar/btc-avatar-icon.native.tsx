import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Avatar, type AvatarProps } from './avatar.native';

interface BtcAvatarIconProps extends Omit<AvatarProps, 'indicator'> {
  indicator?: boolean;
}

export function BtcAvatarIcon({ indicator = false, ...props }: BtcAvatarIconProps) {
  return (
    <Avatar
      icon={<BtcIcon width="100%" height="100%" />}
      indicator={indicator ? <BtcIcon width={16} height={16} /> : undefined}
      {...props}
    />
  );
}
