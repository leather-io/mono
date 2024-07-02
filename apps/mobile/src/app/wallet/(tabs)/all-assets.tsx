import { useContext, useEffect, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACTION_BAR_TOTAL_HEIGHT } from '@/components/action-bar';
import { HEADER_HEIGHT } from '@/components/blurred-header';
import { useTheme } from '@shopify/restyle';

import { Text, Theme } from '@leather.io/ui/native';

import { ActionBarContext, TAB_BAR_HEIGHT } from './_layout';

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

const scrollUntilClosed = 50;
const scrollPaddingBottom = 50;
const scrollPaddingTop = 20;

/**
 *
 * Check if FlatList is scrollPaddingBottom pixels off the bottom
 *
 * @param nativeEvent
 * @returns boolean
 */
const isCloseToBottom = (
  { layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent,
  contentOffsetBottom: number
) => {
  const paddingToBottom = scrollPaddingBottom;
  return (
    layoutMeasurement.height + contentOffset.y - contentOffsetBottom >=
    contentSize.height - paddingToBottom
  );
};

/**
 *
 * Check if FlatList is scrollPaddingTop pixels off the top
 *
 * @param nativeEvent
 * @returns boolean
 */
const isCloseToTop = ({ contentOffset }: NativeScrollEvent, contentOffsetTop: number) => {
  const paddingToTop = scrollPaddingTop;

  return contentOffset.y <= -contentOffsetTop + paddingToTop;
};

export default function SendScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme<Theme>();
  const actionBarContext = useContext(ActionBarContext);

  useEffect(() => {
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [refreshing]);

  const contentOffsetBottom = bottom + ACTION_BAR_TOTAL_HEIGHT;
  const contentOffsetTop = top + HEADER_HEIGHT + TAB_BAR_HEIGHT;

  function createOnScrollHandler() {
    let savedYOffset: number | null = null;
    return function onScrollHandler(event: NativeSyntheticEvent<NativeScrollEvent>) {
      const yOffset = event.nativeEvent.contentOffset.y;
      const isShown = actionBarContext.ref?.current?.isShown;

      // Uninitialized savedYOffset, set it to yOffset
      if (savedYOffset === null) {
        savedYOffset = yOffset;
        return;
      }
      // If the list is close to top, show the action bar.
      if (isCloseToTop(event.nativeEvent, contentOffsetTop)) {
        actionBarContext.ref?.current?.show();
        savedYOffset = yOffset;
        return;
      }
      // If the list is close to bottom, show the action bar.
      if (isCloseToBottom(event.nativeEvent, contentOffsetBottom)) {
        actionBarContext.ref?.current?.show();
        return;
      }
      // If the list scrolled more than scrollUntilClosed pixels after last save, hide action bar
      if (yOffset - savedYOffset > scrollUntilClosed) {
        savedYOffset = yOffset;
        if (isShown) {
          actionBarContext.ref?.current?.hide();
        }
        return;
      }
      // If the list has scrolled even a bit up, show the action bar
      if (yOffset - savedYOffset < 0) {
        savedYOffset = yOffset;
        if (!isShown) {
          actionBarContext.ref?.current?.show();
        }
        return;
      }
      // If the action bar is currently hidden, update savedYOffset
      if (!isShown) {
        savedYOffset = yOffset;
      }
    };
  }

  return (
    <View style={styles.container}>
      <FlatList
        onScroll={createOnScrollHandler()}
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
