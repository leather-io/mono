import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACTION_BAR_TOTAL_HEIGHT } from '@/components/action-bar';
import { createOnScrollHandler, useActionBarContext } from '@/components/action-bar/container';
import { HEADER_HEIGHT } from '@/components/headers/constants';
import { TAB_BAR_HEIGHT } from '@/components/tab-bar';
import { useTheme } from '@shopify/restyle';

import { Text, Theme } from '@leather.io/ui/native';

const DATA = [
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
  {
    title: 'Amazing asset',
  },
];

export default function SendScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme<Theme>();
  const actionBarContext = useActionBarContext();

  useEffect(() => {
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [refreshing]);

  const contentOffsetBottom = bottom + ACTION_BAR_TOTAL_HEIGHT;
  const contentOffsetTop = top + HEADER_HEIGHT + TAB_BAR_HEIGHT;
  return (
    <View style={styles.container}>
      <FlatList
        onScroll={createOnScrollHandler({
          actionBarRef: actionBarContext.ref,
          contentOffsetTop,
          contentOffsetBottom,
        })}
        style={{ flex: 1, width: '100%', paddingHorizontal: theme.spacing[5] }}
        snapToAlignment="center"
        contentInset={{ top: contentOffsetTop, bottom: contentOffsetBottom }}
        contentOffset={{ x: 0, y: -contentOffsetTop }}
        data={DATA}
        renderItem={({ item }) => (
          <Text style={{ height: 100, backgroundColor: 'green' }}>{item.title}</Text>
        )}
        refreshing={refreshing}
        onRefresh={() => setRefreshing(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
