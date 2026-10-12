import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, keepPreviousData, useQuery } from '@tanstack/react-query';

import { QuoteCurrency } from '@leather.io/models';
import { createSip10AccountBalanceQueryConfig } from '@leather.io/queries';
import {
  AccountRequest,
  Sip10Balance,
  UserSettings,
  getSip10BalancesService,
} from '@leather.io/services';
import { getAssetId, isDefined, serializeAssetId } from '@leather.io/utils';

import { balanceQueryOptions } from './balance-query-options';

export function useSip10TotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useSip10AggregateBalanceQuery(accounts.map(account => ({ account }))));
}

interface Sip10AccountBalanceOptions {
  includeHiddenAssets?: boolean;
  keepPreviousData?: boolean;
}

export function useSip10AccountBalance(
  fingerprint: string,
  accountIndex: number,
  options?: Sip10AccountBalanceOptions
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const queryResult = useSip10AccountBalanceQuery(
    { account, assets: { includeHiddenAssets: options?.includeHiddenAssets } },
    options?.keepPreviousData ?? false
  );

  return toFetchState(queryResult);
}

export function useManagedSip10Tools(fingerprint: string, accountIndex: number) {
  const { assetVisibility } = useSettings();
  const visibleSip10s = useSip10AccountBalance(fingerprint, accountIndex, {
    keepPreviousData: true,
  });

  return {
    isLoading: visibleSip10s.state === 'loading',
    isEnabled(token: Sip10Balance) {
      const userSetting = assetVisibility[serializeAssetId(getAssetId(token.asset))];
      if (isDefined(userSetting)) return userSetting;
      return (
        visibleSip10s.value?.sip10s.some(sip10 => sip10.asset.assetId === token.asset.assetId) ??
        false
      );
    },
  };
}

export function useSip10BalanceByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: string
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useSip10BalanceByAssetIdQuery({ account }, assetId));
}

function useSip10AggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-aggregate-balance',
      requests,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AggregateBalance(requests, signal),
    ...balanceQueryOptions,
  });
}

function useSip10AccountBalanceQuery(request: AccountRequest, shouldKeepPreviousData: boolean) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility, defaultAssetVisibility } =
    useSettings();
  const includesHiddenAssets = request.assets?.includeHiddenAssets ?? false;
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility: includesHiddenAssets ? {} : assetVisibility,
    defaultAssetVisibility: includesHiddenAssets ? undefined : defaultAssetVisibility,
  };

  return useQuery({
    ...createSip10AccountBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
    placeholderData: shouldKeepPreviousData ? keepPreviousData : undefined,
  });
}

function useSip10BalanceByAssetIdQuery(request: AccountRequest, assetId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-balance-by-asset-id',
      assetId,
      request,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10BalanceByAssetId(request, assetId, signal),
    ...balanceQueryOptions,
  });
}
