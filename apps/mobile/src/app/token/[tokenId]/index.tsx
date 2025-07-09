import { Token } from '@/features/token/token';
import { useAssetPriceChangeQuery } from '@/queries/assets/fungible-asset-info.query';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { btcAsset, stxAsset } from '@leather.io/constants';

export const configureTokenParamsSchema = z.object({
  tokenId: z.string(),
});

export default function TokenScreen() {
  const { data: assetPriceChange } = useAssetPriceChangeQuery(btcAsset);
  const { data: stxPriceChange } = useAssetPriceChangeQuery(stxAsset);

  console.log('assetPriceChange', assetPriceChange);
  console.log('stxPriceChange', stxPriceChange);

  const params = useLocalSearchParams();
  const { tokenId } = configureTokenParamsSchema.parse(params);
  return <Token tokenId={tokenId} asset={btcAsset} />;
}
