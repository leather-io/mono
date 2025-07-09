import { BtcAvatarIcon, PlaceholderIcon, StxAvatarIcon } from '@leather.io/ui/native';

interface TokenIconProps {
  ticker: string;
  showIndicator?: boolean;
}

export function TokenIcon({ ticker, showIndicator = false }: TokenIconProps) {
  switch (ticker) {
    case 'STX':
      return <StxAvatarIcon indicator={showIndicator} />;
    case 'BTC':
      return <BtcAvatarIcon indicator={showIndicator} />;
    default:
      return <PlaceholderIcon />;
  }
}
