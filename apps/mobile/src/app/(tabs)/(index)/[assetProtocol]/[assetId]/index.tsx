import { useCurrentAccount } from '@/core/current-account-provider';
import { BitcoinTokenDetailsByAccount } from '@/features/token/bitcoin/bitcoin-token-details';
import { Sip10TokenDetailsByAccount } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetailsByAccount } from '@/features/token/stacks/stacks-token-details';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { CryptoAssetProtocols } from '@leather.io/models';
import { assertExistence, assertUnreachable } from '@leather.io/utils';

export const configureTokenParamsSchema = z.object({
  assetId: z.string(),
  assetProtocol: z.string(),
});

// type SupportedAssetProtocol = 'nativeBtc' | 'nativeStx' | 'sip10';

export default function AccountTokenScreen() {
  const params = useLocalSearchParams();
  const { assetId, assetProtocol } = configureTokenParamsSchema.parse(params);
  const { currentAccount } = useCurrentAccount();

  assertExistence(currentAccount, 'Current account is required for AccountTokenScreen');

  switch (assetProtocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetailsByAccount account={currentAccount} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetailsByAccount account={currentAccount} />;
    case CryptoAssetProtocols.sip10:
      return <Sip10TokenDetailsByAccount account={currentAccount} assetId={assetId} />;
    default:
      assertUnreachable(assetProtocol as never); // fix this later
  }
}
