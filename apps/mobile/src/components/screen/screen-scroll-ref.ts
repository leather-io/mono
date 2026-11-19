import { type ComponentRef } from 'react';
import { type FlatList } from 'react-native';
import type { default as Animated, AnimatedRef } from 'react-native-reanimated';

import { type FlashListRef } from '@shopify/flash-list';

type ScreenScrollTarget = ComponentRef<typeof Animated.ScrollView> &
  FlatList<unknown> &
  FlashListRef<never> &
  FlashListRef<unknown>;

export type ScreenScrollRef = AnimatedRef<ScreenScrollTarget>;
