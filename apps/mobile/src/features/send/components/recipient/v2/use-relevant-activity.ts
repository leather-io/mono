import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { FetchState, toFetchState } from '@/shared/fetch-state';
import { Account } from '@/store/accounts/accounts';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { filter, isShallowEqual, pipe } from 'remeda';

import { Activity, FungibleCryptoAssetInfo, SendAssetActivity } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

export function useRelevantActivity(account: Account, assetInfo: FungibleCryptoAssetInfo) {
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
        return pipe(data, filter(isSendActivity), filter(isRelevantSendActivity(assetInfo)));
      },
    })
  );
}

function isSendActivity(activity: Activity) {
  return activity.type === 'sendAsset';
}

function isRelevantSendActivity(assetInfo: FungibleCryptoAssetInfo) {
  return (activity: SendAssetActivity) => isShallowEqual(activity.asset, assetInfo);
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
