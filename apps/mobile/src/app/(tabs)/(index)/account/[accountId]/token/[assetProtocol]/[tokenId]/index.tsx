import { BitcoinTokenDetailsByAccount } from '@/features/token/bitcoin/bitcoin-token-details';
import { Sip10TokenDetailsByAccount } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetailsByAccount } from '@/features/token/stacks/stacks-token-details';
import { deserializeAccountId } from '@/store/accounts/accounts';
import * as Sentry from '@sentry/react-native';
import { useLocalSearchParams } from 'expo-router';

import { CryptoAssetProtocol, CryptoAssetProtocols } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

// export const configureTokenParamsSchema = z.object({
//   accountId: z.string().optional(),
//   assetProtocol: z.string(),
//   tokenId: z.string(),
// });
// just add the only supported asset protocols here
type SupportedAssetProtocols = Pick<CryptoAssetProtocol, 'nativeBtc' | 'nativeStx' | 'sip10'>;

// using this I can assertUnreachable properly
type SupportedAssetProtocol = 'nativeBtc' | 'nativeStx' | 'sip10';

type AccountTokenScreenProps = {
  accountId: string;
  assetProtocol: SupportedAssetProtocol;
  tokenId: string;
};

export default function AccountTokenScreen() {
  // const params = useLocalSearchParams<AccountTokenScreenProps>();
  const { assetProtocol, tokenId, accountId } = useLocalSearchParams<AccountTokenScreenProps>();
  if (!accountId) {
    // throw new Error('accountId is required');
    Sentry.captureException(new Error('accountId is required'));
    return null;
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
      assertUnreachable(assetProtocol);
  }
}
