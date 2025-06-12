import { useCallback, useState } from 'react';
import { RefreshControl as RNRefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { queryClient } from '@/queries/query';

import { HttpCacheService } from '@leather.io/services';

export function useRefreshHandler() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void queryClient.invalidateQueries({
      predicate: query =>
        !(query.queryKey[0] as string).startsWith(HttpCacheService.CACHE_KEY_PREFIX),
    });
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return { refreshing, onRefresh };
}

export function RefreshControl() {
  const { top } = useSafeAreaInsets();
  const { refreshing, onRefresh } = useRefreshHandler();

  return (
    <RNRefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={top} />
  );
}
