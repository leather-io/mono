import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActionBarOffset } from '@/components/action-bar/action-bar';
import { queryClient } from '@/queries/query';

import { HttpCacheService } from '@leather.io/services';
import { Box, HasChildren } from '@leather.io/ui/native';

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

function ScrollableContent({ children }: HasChildren) {
  const { actionBarOffset } = useActionBarOffset();
  const { top } = useSafeAreaInsets();
  const contentOffsetTop = top;

  const { refreshing, onRefresh } = useRefreshHandler();

  return (
    <ScrollView
      contentInset={{ bottom: actionBarOffset }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={contentOffsetTop}
        />
      }
    >
      {children}
    </ScrollView>
  );
}

interface PageLayoutProps extends HasChildren {
  scrollable?: boolean;
}
export function PageLayout({ children, scrollable = true }: PageLayoutProps) {
  return (
    <>
      <Box flex={1} bg="ink.background-primary">
        {scrollable ? <ScrollableContent>{children}</ScrollableContent> : children}
      </Box>
    </>
  );
}
