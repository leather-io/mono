import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { toFetchState } from '@/queries/fetch-state';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { type ActivityView, createActivityView } from '@leather.io/features';
import { type AccountAddresses, type Activity } from '@leather.io/models';
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

function useSip10ActivityByAssetIdQuery(account: AccountAddresses, assetId: string) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference,
    assetVisibility,
  };
  return useQuery<Activity[], Error, ActivityView[]>({
    ...createSip10ActivityByAssetIdQueryConfig(account, assetId, settings),
    select: activity => activity.map(item => createActivityView(item, settings.network)),
  });
}
