import { BitcoinTokenDetails } from '@/features/token/bitcoin/bitcoin-token-details';
import { Sip10TokenDetails } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetails } from '@/features/token/stacks/stacks-token-details';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

export const configureTokenParamsSchema = z.object({
  tokenId: z.string(),
});

export default function TokenScreen() {
  const params = useLocalSearchParams();
  const { tokenId } = configureTokenParamsSchema.parse(params);

  switch (tokenId) {
    case 'BTC':
      return <BitcoinTokenDetails />;
    case 'STX':
      return <StacksTokenDetails />;
    default:
      return <Sip10TokenDetails tokenId={tokenId} />;
  }
}
