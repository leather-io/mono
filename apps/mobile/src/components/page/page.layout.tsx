import { useCallback, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActionBarContainer,
  createOnScrollHandler,
} from '@/components/action-bar/action-bar-container';
import { queryClient } from '@/queries/query';

import { HttpCacheService } from '@leather.io/services';
import { Box, HasChildren } from '@leather.io/ui/native';

import { ACTION_BAR_TOTAL_HEIGHT, ActionBarMethods } from '../action-bar/action-bar';

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
  const { bottom, top } = useSafeAreaInsets();
  const actionBarRef = useRef<ActionBarMethods>(null);
  const contentOffsetBottom = bottom + ACTION_BAR_TOTAL_HEIGHT;
  const contentOffsetTop = top;

  const { refreshing, onRefresh } = useRefreshHandler();

  return (
    <ScrollView
      onScroll={createOnScrollHandler({
        actionBarRef,
        contentOffsetTop,
        contentOffsetBottom,
      })}
      contentInset={{ bottom: contentOffsetBottom }}
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
  const actionBarRef = useRef<ActionBarMethods>(null);

  return (
    <>
      <Box flex={1} bg="ink.background-primary">
        {scrollable ? <ScrollableContent>{children}</ScrollableContent> : children}
      </Box>
      <ActionBarContainer ref={actionBarRef} />
    </>
  );
}
