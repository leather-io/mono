import { toFetchState } from '@/components/loading';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { ActivityView, createActivityView } from '@leather.io/features';
import { AccountAddresses, Activity, QuoteCurrency } from '@leather.io/models';
import { createSip10ActivityByAssetIdQueryConfig } from '@leather.io/queries';
import type { UserSettings } from '@leather.io/services';

export function useSip10ActivityByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: string
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useSip10ActivityByAssetIdQuery(account, assetId));
}

export function useSip10ActivityByAssetIdQuery(account: AccountAddresses, assetId: string) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  return useQuery<Activity[], Error, ActivityView[]>({
    ...createSip10ActivityByAssetIdQueryConfig(account, assetId, settings),
    select: activity => activity.map(item => createActivityView(item, settings.network)),
  });
}
