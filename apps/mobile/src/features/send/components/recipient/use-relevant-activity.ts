import { FetchState, toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';
import { filter, isDefined, isShallowEqual, pipe } from 'remeda';

import {
  AccountId,
  Activity,
  FungibleCryptoAsset,
  QuoteCurrency,
  SendAssetActivity,
} from '@leather.io/models';
import { createActivityQueryConfig } from '@leather.io/queries';
import { UserSettings } from '@leather.io/services';

interface UseRelevantActivityProps {
  asset: FungibleCryptoAsset;
  currentAccount: AccountId;
}

export function useRelevantActivity({ asset, currentAccount }: UseRelevantActivityProps) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const { fingerprint, accountIndex } = currentAccount;
  const accountAddresses = useAccountAddresses(fingerprint, accountIndex);
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
  const baseConfig = createActivityQueryConfig(accountAddresses, settings);
  const queryKeyWithCurrency = [...(baseConfig.queryKey ?? []), fiatCurrencyPreference];

  return toFetchState(
    useQuery<Activity[], Error, SendAssetActivity[]>({
      ...baseConfig,
      queryKey: queryKeyWithCurrency,
      select: data =>
        pipe(data, filter(isValidSendActivity), filter(isRelevantSendActivity(asset))),
    })
  );
}

function isValidSendActivity(activity: Activity): activity is SendAssetActivity {
  return (
    activity.type === 'sendAsset' &&
    // Items from the API response sometimes erroneously contain no receivers or empty strings
    isDefined(activity.receivers[0]) &&
    activity.receivers[0].length !== 0
  );
}

function isRelevantSendActivity(asset: FungibleCryptoAsset) {
  return (activity: SendAssetActivity) => isShallowEqual(activity.asset, asset);
}

interface MatchRelevantActivityResult {
  result: FetchState<SendAssetActivity[]>;
  loading: React.ReactNode;
  error(error: string): React.ReactNode;
  success(data: SendAssetActivity[]): React.ReactNode;
}

export function matchRelevantActivityResult({
  error,
  loading,
  result,
  success,
}: MatchRelevantActivityResult) {
  if (result.state === 'loading') return loading;
  if (result.state === 'error') return error(result.errorMessage);
  return success(result.value);
}
