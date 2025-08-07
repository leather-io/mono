import { BitcoinTokenDetailsByAccount } from '@/features/token/bitcoin/bitcoin-token-details';
import { Sip10TokenDetails } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetailsByAccount } from '@/features/token/stacks/stacks-token-details';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

export const configureTokenParamsSchema = z.object({
  tokenId: z.string(),
  accountId: z.string().optional(),
});

export default function AccountTokenScreen() {
  const params = useLocalSearchParams();
  const { tokenId, accountId } = configureTokenParamsSchema.parse(params);
  if (!accountId) {
    throw new Error('accountId is required');
  }
  const { accountIndex, fingerprint } = deserializeAccountId(accountId);

  switch (tokenId) {
    case 'BTC':
      return <BitcoinTokenDetailsByAccount accountIndex={accountIndex} fingerprint={fingerprint} />;
    case 'STX':
      return <StacksTokenDetailsByAccount accountIndex={accountIndex} fingerprint={fingerprint} />;
    default:
      return <Sip10TokenDetails tokenId={tokenId} />;
  }
}
