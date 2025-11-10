import BtcIcon from '../../assets/icons/bitcoin.svg';
import OrdinalIcon from '../../assets/icons/ordinal-24-24.svg';
import { Avatar, AvatarProps } from './avatar.native';

interface OrdinalAvatarIconProps extends Omit<AvatarProps, 'indicator'> {
  indicator?: boolean;
}

export function OrdinalAvatarIcon({ indicator = false, ...props }: OrdinalAvatarIconProps) {
  return (
    <Avatar
      icon={<OrdinalIcon width="100%" height="100%" />}
      indicator={indicator ? <BtcIcon width={16} height={16} /> : undefined}
      {...props}
    />
  );
}
