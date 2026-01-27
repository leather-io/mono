import { useMemo } from 'react';

import { toFetchState } from '@/components/loading/fetch-state';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { type CollectibleView, createCollectibleView } from '@leather.io/features';
import {
  type AccountAddresses,
  type CryptoAssetId,
  type NonFungibleCryptoAsset,
  QuoteCurrency,
} from '@leather.io/models';
import { createAccountCollectiblesQueryConfig } from '@leather.io/queries';
import { type AccountRequest, type UserSettings } from '@leather.io/services';
import { SerializedCryptoAssetId, deserializeAssetId, matchesAssetId } from '@leather.io/utils';

export function useAccountCollectibleByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: SerializedCryptoAssetId
) {
  const account = useAccountAddresses(fingerprint, accountIndex);

  return toFetchState<CollectibleView[]>(
    useAccountCollectibleByAssetIdQuery(account, deserializeAssetId(assetId))
  );
}

export function useAccountCollectibles(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState<CollectibleView[]>(useAccountCollectiblesQuery(account));
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

function useAccountCollectiblesQuery(
  account: AccountAddresses,
  options: Partial<UseQueryOptions<NonFungibleCryptoAsset[], Error, CollectibleView[]>> = {}
) {
  const sanitizedAccount = useSanitizedAccount(account);
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  const { select, ...rest } = options;
  const request: AccountRequest = { account: sanitizedAccount };

  return useQuery<NonFungibleCryptoAsset[], Error, CollectibleView[]>({
    ...createAccountCollectiblesQueryConfig(request, settings, ['all']),
    ...rest,
    select: select ?? (collectibles => collectibles.map(createCollectibleView)),
  });
}

function useAccountCollectibleByAssetIdQuery(account: AccountAddresses, assetId: CryptoAssetId) {
  const sanitizedAccount = useSanitizedAccount(account);
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  const request: AccountRequest = { account: sanitizedAccount };

  return useQuery<NonFungibleCryptoAsset[], Error, CollectibleView[]>({
    ...createAccountCollectiblesQueryConfig(request, settings, ['by-asset', assetId]),
    select: collectibles =>
      collectibles
        .filter(collectible => matchesAssetId(collectible, assetId))
        .map(createCollectibleView),
  });
}
