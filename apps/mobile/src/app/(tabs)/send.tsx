import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACTION_BAR_TOTAL_HEIGHT } from '@/components/action-bar';
import { HEADER_HEIGHT } from '@/components/blurred-header';
import { useTheme } from '@shopify/restyle';

import { Text, Theme } from '@leather.io/ui/native';

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

export default function SendScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme<Theme>();

  useEffect(() => {
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [refreshing]);

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1, width: '100%', paddingHorizontal: theme.spacing[5] }}
        snapToAlignment="center"
        contentInset={{ top: top + HEADER_HEIGHT, bottom: bottom + ACTION_BAR_TOTAL_HEIGHT }}
        contentOffset={{ x: 0, y: -(top + HEADER_HEIGHT) }}
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
