import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { AccountAddresses, CryptoAsset, QuoteCurrency } from '@leather.io/models';
import {
  type UseActivityQueryOptions,
  createActivityByAssetQueryConfig,
  createActivityQueryConfig,
} from '@leather.io/queries';
import type { UserSettings } from '@leather.io/services';

function useBaseActivityQuery(account: AccountAddresses, options: UseActivityQueryOptions = {}) {
  const { networkPreference, fiatCurrencyPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  return useQuery(createActivityQueryConfig(account, settings, options));
}

export function useActivity(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const { fiatCurrencyPreference } = useSettings();
  return toFetchState(useBaseActivityQuery(account, { queryKeyContext: [fiatCurrencyPreference] }));
}

export function useActivityByAsset(fingerprint: string, accountIndex: number, asset: CryptoAsset) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useActivityByAssetQuery(account, asset));
}

export function useActivityQuery(account: AccountAddresses) {
  const { fiatCurrencyPreference } = useSettings();
  return useBaseActivityQuery(account, {
    queryKeyContext: [fiatCurrencyPreference],
  });
}

export function useActivityByAssetQuery(account: AccountAddresses, asset: CryptoAsset) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  return useQuery(createActivityByAssetQueryConfig(account, asset, settings));
}
