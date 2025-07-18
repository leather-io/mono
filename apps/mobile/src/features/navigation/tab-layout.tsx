import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
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

import { TabButton } from './tab-button';
import { TabLayoutContext } from './tab-layout-context';

export function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme<Theme>();
  const [tabBarHeight, setTabBarHeight] = useState(0);
  return (
    <TabLayoutContext.Provider value={{ tabBarHeight }}>
      <Tabs>
        <TabSlot />
        <LinearGradient
          colors={[
            colors['ink.background-primary'],
            colors['ink.border-default'],
            colors['ink.border-default'],
            colors['ink.background-primary'],
          ]}
          locations={[0, 0.4, 0.6, 1]}
          style={{ width: '100%', height: 1 }}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
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
              title={t({ id: 'tabs.button.home.title', message: 'Home' })}
            />
          </TabTrigger>
          <TabTrigger asChild style={{ flex: 1 }} name="activity" href="/(tabs)/activity">
            <TabButton
              activeIcon={<ActivityActiveIcon />}
              defaultIcon={<ActivityDefaultIcon />}
              title={t({ id: 'tabs.button.activity.title', message: 'Activity' })}
            />
          </TabTrigger>
          <TabTrigger asChild style={{ flex: 1 }} name="browser" href="/(tabs)/browser">
            <TabButton
              activeIcon={<BrowseActiveIcon />}
              defaultIcon={<BrowseDefaultIcon />}
              title={t({ id: 'tabs.button.browser.title', message: 'Browser' })}
            />
          </TabTrigger>
        </TabList>
      </Tabs>
    </TabLayoutContext.Provider>
  );
}
