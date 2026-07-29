import { BtcAvatarIcon, SbtcAvatarIcon } from '@leather.io/ui';

import { LiStxIcon } from './listx-icon';
import { StacksIcon } from './stacks-icon';
import { StStxIcon } from './ststx-icon';

interface ChainLogoIconProps {
  symbol: string;
}
export function ChainLogoIcon(props: ChainLogoIconProps) {
  switch (props.symbol) {
    case 'STX':
      return <StacksIcon />;
    case 'BTC':
      return <BtcAvatarIcon size="sm" />;
    case 'sBTC':
      return <SbtcAvatarIcon size="sm" />;
    case 'LiSTX':
      return <LiStxIcon />;
    case 'stSTX':
      return <StStxIcon />;
    default:
      return props.symbol;
  }
}
