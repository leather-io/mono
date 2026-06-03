import type { ComponentProps, ReactElement } from 'react';

import { AssetAvatarIcon } from '@leather.io/ui';

import type { Chain } from '../data/multisig-types';

type ChainAvatarAsset = { protocol: 'nativeBtc' } | { protocol: 'nativeStx' };

export function chainToAvatarAsset(chain: Chain): ChainAvatarAsset {
  return chain === 'btc' ? { protocol: 'nativeBtc' } : { protocol: 'nativeStx' };
}

interface ChainAvatarProps {
  chain: Chain;
  size?: ComponentProps<typeof AssetAvatarIcon>['size'];
  boxSize?: string;
  indicator?: ReactElement;
}

export function ChainAvatar({ chain, size, boxSize, indicator }: ChainAvatarProps) {
  return (
    <AssetAvatarIcon
      asset={chainToAvatarAsset(chain)}
      size={boxSize ? 'sm' : size}
      width={boxSize}
      height={boxSize}
      indicator={indicator}
    />
  );
}
