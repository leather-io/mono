import { Token } from '@/features/token/token';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { btcAsset } from '@leather.io/constants';

export const configureTokenParamsSchema = z.object({
  tokenId: z.string(),
});

export default function TokenScreen() {
  const params = useLocalSearchParams();
  const { tokenId } = configureTokenParamsSchema.parse(params);
  return <Token tokenId={tokenId} asset={btcAsset} />;
}
