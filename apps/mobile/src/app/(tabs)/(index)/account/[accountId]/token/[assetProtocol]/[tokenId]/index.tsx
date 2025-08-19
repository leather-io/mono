import { BitcoinTokenDetailsByAccount } from '@/features/token/bitcoin/bitcoin-token-details';
import { Sip10TokenDetailsByAccount } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetailsByAccount } from '@/features/token/stacks/stacks-token-details';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { CryptoAssetProtocols } from '@leather.io/models';

export const configureTokenParamsSchema = z.object({
  accountId: z.string().optional(),
  assetProtocol: z.string(),
  tokenId: z.string(),
});

export default function AccountTokenScreen() {
  const params = useLocalSearchParams();
  const { assetProtocol, tokenId, accountId } = configureTokenParamsSchema.parse(params);
  if (!accountId) {
    throw new Error('accountId is required');
  }
  const { accountIndex, fingerprint } = deserializeAccountId(accountId);

  switch (assetProtocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetailsByAccount accountIndex={accountIndex} fingerprint={fingerprint} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetailsByAccount accountIndex={accountIndex} fingerprint={fingerprint} />;
    case CryptoAssetProtocols.sip10:
      return (
        <Sip10TokenDetailsByAccount
          accountIndex={accountIndex}
          fingerprint={fingerprint}
          tokenId={tokenId}
        />
      );
    default:
      throw new Error(`Unknown asset protocol: ${assetProtocol}`);
  }
}
