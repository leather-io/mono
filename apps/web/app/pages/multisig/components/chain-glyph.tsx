import { BitcoinIcon, StacksIcon } from '@leather.io/ui';

import type { Chain } from '../data/multisig-types';
import { bitcoinColor } from '../multisig-tokens';

interface ChainGlyphProps {
  chain: Chain;
  variant?: 'small' | 'medium' | 'large';
}

// Brand-colored chain mark. Both icons use fill="currentColor"; stacks has a
// color token, bitcoin does not (raw hex via inline style — a documented gap).
export function ChainGlyph({ chain, variant = 'small' }: ChainGlyphProps) {
  if (chain === 'btc') {
    return <BitcoinIcon variant={variant} style={{ color: bitcoinColor }} />;
  }
  return <StacksIcon variant={variant} color="stacks" />;
}
