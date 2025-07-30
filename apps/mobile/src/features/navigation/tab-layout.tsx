import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useSegments } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import {
  ActivityActiveIcon,
  ActivityDefaultIcon,
  BrowseActiveIcon,
  BrowseDefaultIcon,
  HomeActiveIcon,
  HomeDefaultIcon,
  Theme,
} from '@leather.io/ui/native';

import { BottomGradient } from './bottom-gradient';
import { TabButton } from './tab-button';
import { TabLayoutContext } from './tab-layout-context';

function ConditionalGradient() {
  const segments = useSegments();

  // expo-router compiles types for the segments after running pnpm ios.
  // Running pnpm build before that fails as it considers that segments should be a tuple with 1 string in it.
  // Fixing that with an "any"
  return segments[1 as any] === 'browser' ? null : <BottomGradient />;
}

export function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme<Theme>();
  const [tabBarHeight, setTabBarHeight] = useState(0);

  return (
    <TabLayoutContext.Provider value={{ tabBarHeight }}>
      <Tabs>
        <TabSlot />
        <ConditionalGradient />

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
              title={t({ id: 'tabs.button.home.title', message: 'Home' })}
            />
          </TabTrigger>
          <TabTrigger asChild style={{ flex: 1 }} name="activity" href="/(tabs)/activity">
            <TabButton
              activeIcon={<ActivityActiveIcon />}
              defaultIcon={<ActivityDefaultIcon />}
              name="activity"
              title={t({ id: 'tabs.button.activity.title', message: 'Activity' })}
            />
          </TabTrigger>
          <TabTrigger asChild style={{ flex: 1 }} name="browser" href="/(tabs)/browser">
            <TabButton
              activeIcon={<BrowseActiveIcon />}
              defaultIcon={<BrowseDefaultIcon />}
              name="browser"
              title={t({ id: 'tabs.button.browser.title', message: 'Browser' })}
            />
          </TabTrigger>
        </TabList>
      </Tabs>
    </TabLayoutContext.Provider>
  );
}
