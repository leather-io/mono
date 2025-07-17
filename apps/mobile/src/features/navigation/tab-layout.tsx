import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import { BrowserIcon, HomeIcon, PulseIcon, Theme } from '@leather.io/ui/native';

import { TabButton } from './tab-button';

export function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme<Theme>();
  return (
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
        style={{
          paddingHorizontal: 64,
          paddingBottom: bottom,
          backgroundColor: colors['ink.background-primary'],
        }}
      >
        <TabTrigger style={{ flex: 1 }} name="(index)" href="/(tabs)/(index)">
          <TabButton
            icon={<HomeIcon />}
            title={t({ id: 'tabs.button.home.title', message: 'Home' })}
          />
        </TabTrigger>
        <TabTrigger style={{ flex: 1 }} name="activity" href="/(tabs)/activity">
          <TabButton
            icon={<PulseIcon />}
            title={t({ id: 'tabs.button.activity.title', message: 'Activity' })}
          />
        </TabTrigger>
        <TabTrigger style={{ flex: 1 }} name="browser" href="/(tabs)/browser">
          <TabButton
            icon={<BrowserIcon />}
            title={t({ id: 'tabs.button.browser.title', message: 'Browser' })}
          />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
