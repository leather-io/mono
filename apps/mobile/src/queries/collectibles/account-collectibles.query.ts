import { toFetchState } from '@/components/loading/fetch-state';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { AccountAddresses, CryptoAssetId, QuoteCurrency } from '@leather.io/models';
import { createAccountCollectiblesQueryConfig } from '@leather.io/queries';
import { AccountRequest, UserSettings } from '@leather.io/services';
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
  const query = useAccountCollectiblesQuery(account);
  return { ...toFetchState(query), isFetching: query.isFetching };
}

function useAccountCollectiblesQuery(account: AccountAddresses) {
  const collectiblesFlag = useCollectiblesFlag();
  if (!collectiblesFlag) {
    account.bitcoin = undefined;
  }
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  const request: AccountRequest = { account };

  return useQuery({
    ...createAccountCollectiblesQueryConfig(request, settings),
  });
}
function useAccountCollectibleByAssetIdQuery(account: AccountAddresses, assetId: CryptoAssetId) {
  const collectiblesFlag = useCollectiblesFlag();
  if (!collectiblesFlag) {
    account.bitcoin = undefined;
  }
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  const request: AccountRequest = { account };

  return useQuery({
    ...createAccountCollectiblesQueryConfig(request, settings),
    select: collectibles =>
      collectibles.filter(collectible => matchesAssetId(collectible, assetId)),
  });
}
