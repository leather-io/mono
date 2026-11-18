import { z } from 'zod';

import {
  type CryptoAssetId,
  type FungibleAssetId,
  type FungibleCryptoAsset,
  FungibleCryptoAssetProtocols,
} from '@leather.io/models';

const fungibleCryptoAssetProtocolSchema = z.enum(FungibleCryptoAssetProtocols);

export function toFungibleAssetId({ protocol, id }: CryptoAssetId): FungibleAssetId | undefined {
  const parsedProtocol = fungibleCryptoAssetProtocolSchema.safeParse(protocol);
  return parsedProtocol.success ? { protocol: parsedProtocol.data, id } : undefined;
}

export function getFungibleAssetId(asset: FungibleCryptoAsset): FungibleAssetId {
  if (asset.protocol === 'sip10') return { protocol: asset.protocol, id: asset.assetId };
  return { protocol: asset.protocol, id: asset.symbol };
}
