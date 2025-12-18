import type { ReactElement } from 'react';

import { getAvatarFallbackText, getAvatarUrl } from './avatar.shared';
import { Avatar, type AvatarProps } from './avatar.web';
import { BtcAvatarIcon } from './btc-avatar-icon.web';
import { Sip10AvatarIcon } from './sip10-avatar-icon.web';
import { StxAvatarIcon } from './stx-avatar-icon.web';
import type { AssetForAvatar } from './types.shared';

export interface AssetAvatarIconProps extends AvatarProps {
  asset: AssetForAvatar;
  indicator?: ReactElement;
}

export function AssetAvatarIcon({ asset, indicator, size, ...rest }: AssetAvatarIconProps) {
  switch (asset.protocol) {
    case 'nativeStx':
      return <StxAvatarIcon indicator={indicator} size={size} {...rest} />;
    case 'nativeBtc':
      return <BtcAvatarIcon indicator={indicator} size={size} {...rest} />;
    case 'sip10': {
      if ('contractId' in asset && 'imageCanonicalUri' in asset && 'name' in asset) {
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
      // If we ever receive a malformed sip10 asset, degrade gracefully.
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
