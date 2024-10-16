import { BtcAvatarIcon, PlaceholderIcon, StxAvatarIcon } from '@leather.io/ui/native';

interface TokensIconProps {
  ticker: string;
}

export function TokensIcon({ ticker }: TokensIconProps) {
  switch (ticker) {
    case 'STX':
      return <StxAvatarIcon />;
    case 'BTC':
      return <BtcAvatarIcon />;
    default:
      return <PlaceholderIcon />;
  }
}
