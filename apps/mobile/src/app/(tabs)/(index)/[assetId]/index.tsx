import { useCurrentAccount } from '@/core/current-account-provider';
import { BitcoinTokenDetailsByAccount } from '@/features/token/bitcoin/bitcoin-token-details';
import { Sip10TokenDetailsByAccount } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetailsByAccount } from '@/features/token/stacks/stacks-token-details';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { assertExistence } from '@leather.io/utils';

export const configureTokenParamsSchema = z.object({
  assetId: z.string(),
});

export default function AccountTokenScreen() {
  const params = useLocalSearchParams();
  const { assetId } = configureTokenParamsSchema.parse(params);
  const { currentAccount } = useCurrentAccount();

  assertExistence(currentAccount, 'Current account is required for AccountTokenScreen');

  switch (assetId) {
    case 'BTC':
      return <BitcoinTokenDetailsByAccount account={currentAccount} />;
    case 'STX':
      return <StacksTokenDetailsByAccount account={currentAccount} />;
    default:
      return <Sip10TokenDetailsByAccount account={currentAccount} assetId={assetId} />;
  }
}
