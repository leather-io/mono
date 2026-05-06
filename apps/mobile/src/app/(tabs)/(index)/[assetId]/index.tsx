import { useOrdinalsFlag } from '@/features/feature-flags';
import { BitcoinTokenDetails } from '@/features/token/bitcoin/bitcoin-token-details';
import { InscriptionDetails } from '@/features/token/bitcoin/inscription-details';
import { Sip9Details } from '@/features/token/stacks/sip9-details';
import { Sip10TokenDetails } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetails } from '@/features/token/stacks/stacks-token-details';
import { isSupportedAssetProtocol } from '@/features/token/types';
import { useTokenTracking } from '@/hooks/use-token-tracking';
import { useSettings } from '@/store/settings/settings';
import { useLocalSearchParams } from 'expo-router';

import { CryptoAssetProtocols } from '@leather.io/models';
import { SerializedCryptoAssetId, assertExistence, deserializeAssetId } from '@leather.io/utils';

export default function AccountTokenScreen() {
  const { assetId } = useLocalSearchParams<{
    assetId: SerializedCryptoAssetId;
  }>();
  const { currentAccount } = useSettings();
  const { protocol: assetProtocol } = deserializeAssetId(assetId);
  const ordinalsFlag = useOrdinalsFlag();
  assertExistence(currentAccount, 'Current account is required for AccountTokenScreen');

  useTokenTracking({ currentAccount, assetId, assetProtocol });

  switch (assetProtocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetails account={currentAccount} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails account={currentAccount} />;
    case CryptoAssetProtocols.sip10:
      return <Sip10TokenDetails account={currentAccount} assetId={assetId} />;
    case CryptoAssetProtocols.sip9:
      return <Sip9Details account={currentAccount} assetId={assetId} />;
    case CryptoAssetProtocols.inscription:
      if (!ordinalsFlag) return null;
      return <InscriptionDetails account={currentAccount} assetId={assetId} />;
    case CryptoAssetProtocols.stamp:
    case CryptoAssetProtocols.rune:
      // FIXME: safely return null without throwing an error until we make sure we don't send stamps through collectibles api
      return null;
    default:
      if (!isSupportedAssetProtocol(assetProtocol)) {
        throw new Error(`Unsupported asset protocol: ${assetProtocol}`);
      }
      return null;
  }
}
