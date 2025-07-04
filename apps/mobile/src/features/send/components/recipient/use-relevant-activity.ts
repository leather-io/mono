import { FetchState, toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { Account } from '@/store/accounts/accounts';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { filter, isDefined, isShallowEqual, pipe } from 'remeda';

import { Activity, FungibleCryptoAsset, SendAssetActivity } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

export function useRelevantActivity(account: Account, asset: FungibleCryptoAsset) {
  const { fingerprint, accountIndex } = account;
  const { fiatCurrencyPreference } = useSettings();
  const accountAddresses = useAccountAddresses(fingerprint, accountIndex);

  // TODO: Duplicate of useActivityQuery with the same key but different selection.
  //       Look into removing this by enabling passing options into custom query hooks.
  return toFetchState(
    useQuery({
      queryKey: ['activity-service-get-account-activity', accountAddresses, fiatCurrencyPreference],
      queryFn: ({ signal }: QueryFunctionContext) =>
        getActivityService().getAccountActivity(accountAddresses, signal),
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: 1 * 5000,
      gcTime: 1 * 5000,
      select: data => {
        return pipe(data, filter(isValidSendActivity), filter(isRelevantSendActivity(asset)));
      },
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
  error: (error: string) => React.ReactNode;
  success: (data: SendAssetActivity[]) => React.ReactNode;
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
