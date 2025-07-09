import { Token } from '@/features/token/token';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

export const configureTokenParamsSchema = z.object({
  tokenId: z.string(),
});

export default function TokenScreen() {
  const params = useLocalSearchParams();
  const { tokenId } = configureTokenParamsSchema.parse(params);
  return <Token tokenId={tokenId} />;
}
