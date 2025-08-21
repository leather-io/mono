import { useCurrentAccount } from '@/core/current-account-provider';
import { BitcoinTokenDetails } from '@/features/token/bitcoin/bitcoin-token-details';
import { Sip10TokenDetails } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetails } from '@/features/token/stacks/stacks-token-details';
import { useLocalSearchParams } from 'expo-router';

import { CryptoAssetProtocols } from '@leather.io/models';
import { assertExistence, assertUnreachable } from '@leather.io/utils';

type SupportedAssetProtocol = 'nativeBtc' | 'nativeStx' | 'sip10';

export default function AccountTokenScreen() {
  const { assetId, assetProtocol } = useLocalSearchParams<{
    assetId: string;
    assetProtocol: SupportedAssetProtocol;
  }>();
  const { currentAccount } = useCurrentAccount();

  assertExistence(currentAccount, 'Current account is required for AccountTokenScreen');

  switch (assetProtocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetails account={currentAccount} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails account={currentAccount} />;
    case CryptoAssetProtocols.sip10:
      return <Sip10TokenDetails account={currentAccount} assetId={assetId} />;
    default:
      assertUnreachable(assetProtocol);
  }
}
