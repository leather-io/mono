import { Token } from '@/features/token/token';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { btcAsset, stxAsset } from '@leather.io/constants';

export const configureTokenParamsSchema = z.object({
  tokenId: z.string(),
});

export default function TokenScreen() {
  const params = useLocalSearchParams();
  const { tokenId } = configureTokenParamsSchema.parse(params);
  return <Token tokenId={tokenId} asset={tokenId === 'STX' ? stxAsset : btcAsset} />;
}
