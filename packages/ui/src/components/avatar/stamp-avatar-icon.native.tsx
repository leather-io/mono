import BtcIcon from '../../assets/icons/bitcoin.svg';
import StampIcon from '../../assets/icons/stamp-24-24.svg';
import { Avatar, AvatarProps } from './avatar.native';

interface StampAvatarIconProps extends Omit<AvatarProps, 'indicator'> {
  indicator?: boolean;
}

export function StampAvatarIcon({ indicator = false, ...props }: StampAvatarIconProps) {
  return (
    <Avatar
      icon={<StampIcon width="100%" height="100%" />}
      indicator={indicator ? <BtcIcon width={16} height={16} /> : undefined}
      {...props}
    />
  );
}
