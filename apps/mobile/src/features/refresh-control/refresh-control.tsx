import { useCallback, useState } from 'react';
import {
  RefreshControl as RNRefreshControl,
  RefreshControlProps as RNRefreshControlProps,
} from 'react-native';

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

interface RefreshControlProps extends Omit<RNRefreshControlProps, 'onRefresh' | 'refreshing'> {
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function RefreshControl(props: RefreshControlProps) {
  const { refreshing, onRefresh } = useRefreshHandler();
  return <RNRefreshControl refreshing={refreshing} onRefresh={onRefresh} {...props} />;
}
