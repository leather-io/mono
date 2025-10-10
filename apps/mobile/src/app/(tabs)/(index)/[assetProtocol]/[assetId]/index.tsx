import { BitcoinTokenDetails } from '@/features/token/bitcoin/bitcoin-token-details';
import { InscriptionDetails } from '@/features/token/bitcoin/inscription-details';
import { RuneTokenDetails } from '@/features/token/bitcoin/rune-token-details';
import { StampDetails } from '@/features/token/bitcoin/stamp-details';
import { Sip9TokenDetails } from '@/features/token/stacks/sip9-details';
import { Sip10TokenDetails } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetails } from '@/features/token/stacks/stacks-token-details';
import { SupportedAssetProtocol } from '@/features/token/types';
import { useSettings } from '@/store/settings/settings';
import { useLocalSearchParams } from 'expo-router';

import { CryptoAssetProtocols } from '@leather.io/models';
import { assertExistence, assertUnreachable } from '@leather.io/utils';

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
    case CryptoAssetProtocols.sip9:
      return <Sip9TokenDetails account={currentAccount} assetId={assetId} />;
    case CryptoAssetProtocols.inscription:
      return <InscriptionDetails account={currentAccount} assetId={assetId} />;
    case CryptoAssetProtocols.stamp:
      return <StampDetails account={currentAccount} assetId={assetId} />;

    default:
      assertUnreachable(assetProtocol);
  }
}
