import { useMemo } from 'react';

import { toFetchState } from '@/components/loading/fetch-state';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useQuery } from '@tanstack/react-query';

import { createCollectibleView } from '@leather.io/features';
import { AccountAddresses, CryptoAssetId } from '@leather.io/models';
import { createAccountCollectiblesQueryConfig } from '@leather.io/queries';
import { SerializedCryptoAssetId, deserializeAssetId, matchesAssetId } from '@leather.io/utils';

export function useAccountCollectibleByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: SerializedCryptoAssetId
) {
  const account = useAccountAddresses(fingerprint, accountIndex);

  return toFetchState(
    useAccountCollectibleByAssetIdQuery(account, deserializeAssetId(assetId))
  );
}

export function useAccountCollectibles(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useAccountCollectiblesQuery(account));
}

function useSanitizedAccount(account: AccountAddresses) {
  const collectiblesFlag = useCollectiblesFlag();

  return useMemo<AccountAddresses>(() => {
    if (collectiblesFlag) return account;
    return {
      ...account,
      bitcoin: undefined,
    };
  }, [account, collectiblesFlag]);
}

function useAccountCollectiblesQuery(account: AccountAddresses) {
  const sanitizedAccount = useSanitizedAccount(account);

  return useQuery(
    createAccountCollectiblesQueryConfig(sanitizedAccount, {
      queryKeyContext: ['all'],
      select: collectibles => collectibles.map(createCollectibleView),
    })
  );
}

function useAccountCollectibleByAssetIdQuery(account: AccountAddresses, assetId: CryptoAssetId) {
  const sanitizedAccount = useSanitizedAccount(account);

  return useQuery(
    createAccountCollectiblesQueryConfig(sanitizedAccount, {
      queryKeyContext: ['by-asset', assetId],
      select: collectibles =>
        collectibles
          .filter(collectible => matchesAssetId(collectible, assetId))
          .map(createCollectibleView),
    })
  );
}
