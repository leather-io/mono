import { useParams } from 'react-router';

import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

export function useSendableCollectible() {
  const { assetId, tokenId } = useParams();
  const account = useCurrentAccountAddresses();
  const collectibles = useAccountCollectibles(account);
  const view = collectibles.data?.find(
    item =>
      item.kind !== 'legacy-bns' &&
      item.asset.assetId === assetId &&
      String(item.asset.tokenId) === tokenId
  );
  return { isPending: collectibles.isPending, view };
}
