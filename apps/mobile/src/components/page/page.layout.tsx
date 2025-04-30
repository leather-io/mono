import { useCallback, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActionBarContainer,
  createOnScrollHandler,
} from '@/components/action-bar/action-bar-container';
import { queryClient } from '@/queries/query';

import { Box, HasChildren } from '@leather.io/ui/native';

import { ACTION_BAR_TOTAL_HEIGHT, ActionBarMethods } from '../action-bar/action-bar';

export function PageLayout({ children }: HasChildren) {
  const { bottom, top } = useSafeAreaInsets();
  const actionBarRef = useRef<ActionBarMethods>(null);
  const contentOffsetBottom = bottom + ACTION_BAR_TOTAL_HEIGHT;
  const contentOffsetTop = top;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void queryClient.invalidateQueries({
      predicate: query =>
        query.queryKey[0] !== 'hiro-stacks-get-nft-token-metadata' &&
        query.queryKey[0] !== 'leather-api-rune' &&
        query.queryKey[0] !== 'leather-api-sip10-token',
    });
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <>
      <Box flex={1} bg="ink.background-primary">
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
      </Box>
      <ActionBarContainer ref={actionBarRef} />
    </>
  );
}
