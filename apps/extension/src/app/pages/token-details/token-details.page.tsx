import { useParams } from 'react-router';

import { CryptoAssetProtocols } from '@leather.io/models';

import { urlPathToAssetId } from '@app/common/asset-url';
import { CollectibleDetails } from '@app/features/token/collectible-details';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

export function TokenDetailsPage() {
  const params = useParams();
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);

  const pathSegments = params['*'] || '';
  const assetId = urlPathToAssetId(pathSegments);

  const protocol = pathSegments.split('/')[0];

  const collectibleProtocol =
    protocol === 'inscription'
      ? CryptoAssetProtocols.inscription
      : protocol === 'sip9'
        ? CryptoAssetProtocols.sip9
        : protocol === 'stamp'
          ? CryptoAssetProtocols.stamp
          : null;

  if (!collectibleProtocol) {
    return null;
  }

  return <CollectibleDetails account={account} assetId={assetId} protocol={collectibleProtocol} />;
}
