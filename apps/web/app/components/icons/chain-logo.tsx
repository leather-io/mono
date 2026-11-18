import { BtcAvatarIcon, SbtcAvatarIcon } from '@leather.io/ui';

import { LiStxIcon } from './listx-icon';
import { StacksIcon } from './stacks-icon';
import { StStxIcon } from './ststx-icon';

interface ChainLogoIconProps {
  symbol: string;
  // Only the img-backed logos take a pixel size. The avatar-backed ones follow
  // the avatar scale, where `sm` is already the 24px tile this matches.
  size?: number;
}
export function ChainLogoIcon({ symbol, size }: ChainLogoIconProps) {
  switch (symbol) {
    case 'STX':
      return <StacksIcon size={size} />;
    case 'BTC':
      return <BtcAvatarIcon size="sm" />;
    case 'sBTC':
      return <SbtcAvatarIcon size="sm" />;
    case 'LiSTX':
      return <LiStxIcon size={size} />;
    case 'stSTX':
      return <StStxIcon size={size} />;
    default:
      return symbol;
  }
}
