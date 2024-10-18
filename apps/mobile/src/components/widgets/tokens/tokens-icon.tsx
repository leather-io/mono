import { BtcAvatarIcon, PlaceholderIcon, StxAvatarIcon } from '@leather.io/ui/native';

interface TokensIconProps {
  ticker: string;
}

export function TokensIcon({ ticker }: TokensIconProps) {
  switch (ticker) {
    case 'stx':
      return <StxAvatarIcon />;
    case 'btc':
      return <BtcAvatarIcon />;
    default:
      return <PlaceholderIcon />;
  }
}
