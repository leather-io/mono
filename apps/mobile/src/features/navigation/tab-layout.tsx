import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/core/macro';
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

import { BottomGradient } from './bottom-gradient';
import { TabButton } from './tab-button';
import { TabLayoutContext } from './tab-layout-context';

export function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const [isGradientVisible, setIsGradientVisible] = useState(true);

  return (
    <TabLayoutContext.Provider value={{ tabBarHeight }}>
      <Tabs>
        <TabSlot />
        {isGradientVisible && <BottomGradient />}

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
              toggleGradient={() => setIsGradientVisible(true)}
            />
          </TabTrigger>
          <TabTrigger asChild style={{ flex: 1 }} name="activity" href="/(tabs)/activity">
            <TabButton
              activeIcon={<ActivityActiveIcon />}
              defaultIcon={<ActivityDefaultIcon />}
              name="activity"
              title={t`Activity`}
              toggleGradient={() => setIsGradientVisible(true)}
            />
          </TabTrigger>
          <TabTrigger asChild style={{ flex: 1 }} name="browser" href="/(tabs)/browser">
            <TabButton
              activeIcon={<BrowseActiveIcon />}
              defaultIcon={<BrowseDefaultIcon />}
              name="browser"
              title={t`Browser`}
              toggleGradient={() => setIsGradientVisible(false)}
            />
          </TabTrigger>
        </TabList>
      </Tabs>
    </TabLayoutContext.Provider>
  );
}
