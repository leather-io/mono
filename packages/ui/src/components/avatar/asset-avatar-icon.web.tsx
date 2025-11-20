import type { ReactElement } from 'react';

import type { CryptoAsset } from '@leather.io/models';

import { getAvatarFallbackText, getAvatarUrl } from './avatar.shared';
import { Avatar, type AvatarProps } from './avatar.web';
import { BtcAvatarIcon } from './btc-avatar-icon.web';
import { Sip10AvatarIcon } from './sip10-avatar-icon.web';
import { StxAvatarIcon } from './stx-avatar-icon.web';

export interface AssetAvatarIconProps extends AvatarProps {
  asset: CryptoAsset;
  indicator?: ReactElement;
}

export function AssetAvatarIcon({ asset, indicator, size, ...rest }: AssetAvatarIconProps) {
  switch (asset.protocol) {
    case 'nativeStx':
      return <StxAvatarIcon indicator={indicator} size={size} {...rest} />;
    case 'nativeBtc':
      return <BtcAvatarIcon indicator={indicator} size={size} {...rest} />;
    case 'sip10': {
      return (
        <Sip10AvatarIcon
          contractId={asset.contractId}
          imageCanonicalUri={asset.imageCanonicalUri}
          indicator={indicator}
          name={asset.name}
          size={size}
          {...rest}
        />
      );
    }
    default: {
      // TODO: add support for other protocols (brc20, src20, runes, etc.)
      return (
        <Avatar
          image={getAvatarUrl(asset.protocol)}
          fallback={getAvatarFallbackText(asset.protocol)}
          indicator={indicator}
          size={size}
          {...rest}
        />
      );
    }
  }
}
