import { toFetchState } from '@/components/loading/fetch-state';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useQuery } from '@tanstack/react-query';

import {
  getAccountCollectiblesQueryConfig,
  type UseAccountCollectiblesQueryOptions,
} from '@leather.io/features';
import { AccountAddresses, CryptoAssetId } from '@leather.io/models';
import { SerializedCryptoAssetId, deserializeAssetId, matchesAssetId } from '@leather.io/utils';

export function useAccountCollectibleByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: SerializedCryptoAssetId
) {
  const account = useAccountAddresses(fingerprint, accountIndex);

  return toFetchState(useAccountCollectibleByAssetIdQuery(account, deserializeAssetId(assetId)));
}

export function useAccountCollectibles(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useAccountCollectiblesQuery(account));
}

function useAccountCollectiblesQuery(account: AccountAddresses) {
  return useCollectiblesQuery(account);
}

function useAccountCollectibleByAssetIdQuery(account: AccountAddresses, assetId: CryptoAssetId) {
  return useCollectiblesQuery(account, {
    queryKeyContext: [assetId],
    select: collectibles => collectibles.filter(collectible => matchesAssetId(collectible, assetId)),
  });
}

function useCollectiblesQuery(
  account: AccountAddresses,
  options: UseAccountCollectiblesQueryOptions = {}
) {
  const collectiblesFlag = useCollectiblesFlag();
  const sanitizedAccount = collectiblesFlag ? account : { ...account, bitcoin: undefined };

  return useQuery(getAccountCollectiblesQueryConfig(sanitizedAccount, options));
}
