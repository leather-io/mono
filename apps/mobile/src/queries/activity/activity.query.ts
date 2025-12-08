import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { ActivityView, createActivityView } from '@leather.io/features';
import { AccountAddresses, Activity, CryptoAsset, QuoteCurrency } from '@leather.io/models';
import { createActivityByAssetQueryConfig, createActivityQueryConfig } from '@leather.io/queries';
import type { UserSettings } from '@leather.io/services';

function useBaseActivityQuery(
  account: AccountAddresses,
  options: Partial<UseQueryOptions<Activity[], Error, ActivityView[]>> = {}
) {
  const { networkPreference, fiatCurrencyPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  const baseConfig = createActivityQueryConfig(account, settings);
  const { select, ...rest } = options;
  const queryKeyWithCurrency = [...(baseConfig.queryKey ?? []), fiatCurrencyPreference];

  return useQuery<Activity[], Error, ActivityView[]>({
    ...baseConfig,
    ...rest,
    queryKey: queryKeyWithCurrency,
    select:
      select ?? (activity => activity.map(item => createActivityView(item, settings.network))),
  });
}

export function useActivity(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useBaseActivityQuery(account));
}

export function useActivityByAsset(fingerprint: string, accountIndex: number, asset: CryptoAsset) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useActivityByAssetQuery(account, asset));
}

export function useActivityQuery(account: AccountAddresses) {
  return useBaseActivityQuery(account);
}

export function useActivityByAssetQuery(account: AccountAddresses, asset: CryptoAsset) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  return useQuery<Activity[], Error, ActivityView[]>({
    ...createActivityByAssetQueryConfig(account, asset, settings),
    select: activity => activity.map(item => createActivityView(item, settings.network)),
  });
}
