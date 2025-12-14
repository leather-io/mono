import type { ComponentType, ReactElement } from 'react';

import type { CryptoAsset, CryptoAssetChain, Sip9Asset } from '@leather.io/models';

export interface AvatarProps {
  image: string | null;
  imageAlt: string;
  fallback: string;
  indicator?: ReactElement;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
}

export interface AssetAvatarProps {
  asset: CryptoAsset;
  indicator?: ReactElement | true;
}

export function createAssetAvatar(Avatar: ComponentType<AvatarProps>) {
  return function AssetAvatar({ asset, indicator = true }: AssetAvatarProps) {
    const props = getAvatarProps(asset);
    const resolvedIndicator = resolveIndicator(indicator, asset.chain, Avatar);
    return <Avatar {...props} indicator={resolvedIndicator} />;
  };
}

function getAvatarProps(asset: CryptoAsset): Omit<AvatarProps, 'indicator'> {
  switch (asset.protocol) {
    case 'nativeBtc':
      return {
        image: 'https://images.leather.io/tokens/bitcoin-avatar-icon.svg',
        imageAlt: asset.name,
        fallback: 'BTC',
      };
    case 'nativeStx':
      return {
        image: 'https://images.leather.io/tokens/stacks-avatar-icon.svg',
        imageAlt: asset.name,
        fallback: asset.symbol.slice(0, 1),
      };
    case 'sip10':
      return {
        image: asset.imageCanonicalUri,
        imageAlt: asset.name,
        fallback: asset.symbol.slice(0, 1),
      };
    case 'brc20':
    case 'rune':
    case 'stx20':
      return { image: null, imageAlt: asset.symbol, fallback: asset.symbol.slice(0, 1) };
    case 'inscription':
      return {
        image: asset.thumbnailSrc ?? asset.src,
        imageAlt: asset.title,
        fallback: asset.title.slice(0, 1),
      };
    case 'src20':
      return {
        image: asset.deploy_img,
        imageAlt: asset.symbol,
        fallback: asset.symbol.slice(0, 1),
      };
    case 'stamp':
      return { image: asset.stampUrl, imageAlt: 'Stamp', fallback: 'S' };
    case 'sip9':
      return getSip9AvatarProps(asset);
    default:
      return {
        image: null,
        imageAlt: '',
        fallback: '',
      };
  }
}

function getSip9AvatarProps(asset: Sip9Asset): AvatarProps {
  const isImage = asset.content.contentType.startsWith('image/');
  return {
    image: isImage ? asset.content.contentUrl : null,
    imageAlt: asset.name,
    fallback: asset.name.slice(0, 1),
  };
}

const chainIndicatorProps: Record<CryptoAssetChain, Omit<AvatarProps, 'indicator'>> = {
  bitcoin: {
    image: 'https://images.leather.io/tokens/bitcoin-avatar-icon.svg',
    imageAlt: 'Bitcoin',
    fallback: 'B',
  },
  stacks: {
    image: 'https://images.leather.io/tokens/stacks-avatar-icon.svg',
    imageAlt: 'Stacks',
    fallback: 'S',
  },
};

function resolveIndicator(
  indicator: ReactElement | true | undefined,
  chain: CryptoAssetChain,
  Avatar: ComponentType<AvatarProps>
): ReactElement | undefined {
  if (indicator === true) {
    return <Avatar size="xs" {...chainIndicatorProps[chain]} />;
  }
  if (indicator) {
    return indicator;
  }
  return undefined;
}
