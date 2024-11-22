import {
  BtcAvatarIcon,
  IconWithActivity,
  PlaceholderIcon,
  StxAvatarIcon,
} from '@leather.io/ui/native';

interface TokenIconProps {
  ticker: string;
}

export function TokenIcon({ ticker }: TokenIconProps) {
  switch (ticker) {
    case 'STX':
      return <IconWithActivity avatar={<StxAvatarIcon />} activity="error" />;
    // return <StxAvatarIcon />;
    case 'BTC':
      return <BtcAvatarIcon />;
    default:
      return <PlaceholderIcon />;
  }
}
