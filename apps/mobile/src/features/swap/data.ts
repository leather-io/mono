import { AccountSwapAsset } from '@/features/swap/temp/service';
import { useQueryDispatcher } from '@/features/swap/use-query-dispatcher';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { CryptoAssetId } from '@leather.io/models';
import { getAssetId } from '@leather.io/utils';

type CustomQueryOptions = Omit<UseQueryOptions<AccountSwapAsset[]>, 'queryKey' | 'queryFn'> & {
  onSuccess?: (data: AccountSwapAsset[]) => void;
  onError?: (error: Error) => void;
};

export function useBaseAssets(
  getterFn: () => Promise<AccountSwapAsset[]>,
  { onSuccess, onError, ...options }: CustomQueryOptions = {}
) {
  const queryKey = ['base-assets'];
  const query = useQuery({
    queryKey,
    queryFn: () => getterFn(),
    ...options,
  });
  useQueryDispatcher(query, { queryKey, onSuccess, onError });
  return query;
}

export function useTargetAssets(
  getterFn: (assetId: CryptoAssetId) => Promise<AccountSwapAsset[]>,
  baseSwapAsset: AccountSwapAsset | null,
  { onSuccess, onError, ...options }: CustomQueryOptions = {}
) {
  const queryKey = ['target-assets', baseSwapAsset?.asset.symbol, baseSwapAsset?.asset.protocol];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!baseSwapAsset) return [];
      return getterFn(getAssetId(baseSwapAsset.asset));
    },
    enabled: !!baseSwapAsset,
    ...options,
  });
  useQueryDispatcher(query, { queryKey, onSuccess, onError });
  return query;
}
