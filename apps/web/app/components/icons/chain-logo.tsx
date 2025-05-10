import { BitcoinIcon } from './bitcoin-icon';
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
      return <BitcoinIcon />;
    case 'LiSTX':
      return <LiStxIcon />;
    case 'stSTX':
      return <StStxIcon />;
    default:
      return props.symbol;
  }
}
