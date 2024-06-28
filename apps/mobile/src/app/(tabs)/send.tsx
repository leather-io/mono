import { useContext, useEffect, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACTION_BAR_TOTAL_HEIGHT } from '@/components/action-bar';
import { HEADER_HEIGHT } from '@/components/blurred-header';
import { useTheme } from '@shopify/restyle';

import { Text, Theme } from '@leather.io/ui/native';

import { ActionBarContext } from './_layout';

const DATA = [
  {
    title: 'First Item',
  },
  {
    title: 'Second Item',
  },
  {
    title: 'First Item',
  },
  {
    title: 'Second Item',
  },
  {
    title: 'First Item',
  },
  {
    title: 'Second Item',
  },
  {
    title: 'First Item',
  },
  {
    title: 'Second Item',
  },
  {
    title: 'First Item',
  },
  {
    title: 'Second Item',
  },
  {
    title: 'First Item',
  },
  {
    title: 'Second Item',
  },
  {
    title: 'First Item',
  },
  {
    title: 'Second Item',
  },
];

const SCROLL_UNTIL_CLOSE = 50;
const SCROLL_PADDING_BOTTOM = 50;
const SCROLL_PADDING_TOP = 20;

/**
 *
 * Check if FlatList is SCROLL_PADDING_BOTTOM pixels off the bottom
 *
 * @param nativeEvent
 * @returns boolean
 */
const isCloseToBottom = (
  { layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent,
  contentOffsetBottom: number
) => {
  const paddingToBottom = SCROLL_PADDING_BOTTOM;
  return (
    layoutMeasurement.height + contentOffset.y - contentOffsetBottom >=
    contentSize.height - paddingToBottom
  );
};

/**
 *
 * Check if FlatList is SCROLL_PADDING_TOP pixels off the top
 *
 * @param nativeEvent
 * @returns boolean
 */
const isCloseToTop = ({ contentOffset }: NativeScrollEvent, contentOffsetTop: number) => {
  const paddingToTop = SCROLL_PADDING_TOP;

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
  const contentOffsetTop = top + HEADER_HEIGHT;

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
      // If the list scrolled more than SCROLL_UNTIL_CLOSE pixels after last save, hide action bar
      if (yOffset - savedYOffset > SCROLL_UNTIL_CLOSE) {
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
