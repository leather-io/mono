import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBorder } from '@/components/gradient-border';
import { t } from '@lingui/core/macro';
import { useSegments } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import {
  ActivityActiveIcon,
  ActivityDefaultIcon,
  BrowseActiveIcon,
  BrowseDefaultIcon,
  HomeActiveIcon,
  HomeDefaultIcon,
  useTheme,
} from '@leather.io/ui/native';

import { TabButton } from './tab-button';
import { TabLayoutProvider } from './tab-layout-context';

const tabsWithGradientBorder = ['(index)', 'activity'];

export function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const segments: string[] = useSegments();
  const isGradientBorderVisible = segments?.[1] && tabsWithGradientBorder.includes(segments[1]);

  return (
    <TabLayoutProvider tabBarHeight={tabBarHeight}>
      <Tabs>
        <TabSlot />
        {isGradientBorderVisible && <GradientBorder />}

        <TabList
          onLayout={e => {
            setTabBarHeight(e.nativeEvent.layout.height);
          }}
          style={{
            paddingHorizontal: 64,
            paddingBottom: bottom,
            backgroundColor: colors['ink.background-primary'],
          }}
        >
          <TabTrigger asChild style={{ flex: 1 }} name="(index)" href="/(tabs)/(index)">
            <TabButton
              activeIcon={<HomeActiveIcon />}
              defaultIcon={<HomeDefaultIcon />}
              name="(index)"
              title={t`Home`}
            />
          </TabTrigger>
          <TabTrigger asChild style={{ flex: 1 }} name="activity" href="/(tabs)/activity">
            <TabButton
              activeIcon={<ActivityActiveIcon />}
              defaultIcon={<ActivityDefaultIcon />}
              name="activity"
              title={t`Activity`}
            />
          </TabTrigger>
          <TabTrigger asChild style={{ flex: 1 }} name="browser" href="/(tabs)/browser">
            <TabButton
              activeIcon={<BrowseActiveIcon />}
              defaultIcon={<BrowseDefaultIcon />}
              name="browser"
              title={t`Browser`}
            />
          </TabTrigger>
        </TabList>
      </Tabs>
    </TabLayoutProvider>
  );
}
