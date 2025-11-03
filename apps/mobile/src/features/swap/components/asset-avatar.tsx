import {
  SwappableFungibleCryptoAsset,
  isBtcAsset,
  isSip10Asset,
  isStxAsset,
} from '@leather.io/models';
import { AvatarProps, BtcAvatarIcon, Sip10AvatarIcon, StxAvatarIcon } from '@leather.io/ui/native';

interface AssetAvatarProps extends Omit<AvatarProps, 'indicator'> {
  asset: SwappableFungibleCryptoAsset;
  indicator?: boolean;
}

export function AssetAvatar({ asset, ...avatarProps }: AssetAvatarProps) {
  if (isBtcAsset(asset)) {
    return <BtcAvatarIcon {...avatarProps} />;
  }

  if (isStxAsset(asset)) {
    return <StxAvatarIcon {...avatarProps} />;
  }

  if (isSip10Asset(asset)) {
    return (
      <Sip10AvatarIcon
        name={asset.name}
        contractId={asset.contractId}
        imageCanonicalUri={asset.imageCanonicalUri}
        {...avatarProps}
      />
    );
  }

  return null;
}
