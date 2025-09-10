import { BitcoinTokenDetails } from '@/features/token/bitcoin/bitcoin-token-details';
import { RuneTokenDetails } from '@/features/token/bitcoin/rune-token-details';
import { Sip10TokenDetails } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetails } from '@/features/token/stacks/stacks-token-details';
import { useSettings } from '@/store/settings/settings';
import { useLocalSearchParams } from 'expo-router';

import { CryptoAssetProtocols } from '@leather.io/models';
import { assertExistence, assertUnreachable } from '@leather.io/utils';

type SupportedAssetProtocol = 'nativeBtc' | 'nativeStx' | 'sip10' | 'rune';

export default function AccountTokenScreen() {
  const { assetId, assetProtocol } = useLocalSearchParams<{
    assetId: string;
    assetProtocol: SupportedAssetProtocol;
  }>();
  const { currentAccount } = useSettings();

  assertExistence(currentAccount, 'Current account is required for AccountTokenScreen');

  switch (assetProtocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetails account={currentAccount} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails account={currentAccount} />;
    case CryptoAssetProtocols.sip10:
      return <Sip10TokenDetails account={currentAccount} assetId={assetId} />;
    case CryptoAssetProtocols.rune:
      return <RuneTokenDetails account={currentAccount} assetId={assetId} />;
    default:
      assertUnreachable(assetProtocol);
  }
}
