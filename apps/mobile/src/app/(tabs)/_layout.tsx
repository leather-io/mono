import { t } from '@lingui/macro';
import { Tabs } from 'expo-router';

import { BrowserIcon, PulseIcon, WalletIcon } from '@leather.io/ui/native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="(index)"
        options={{
          title: t({
            id: 'tabs.home.title',
            message: 'Home',
          }),
          tabBarIcon: () => <WalletIcon />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t({
            id: 'tabs.home.activity',
            message: 'Activity',
          }),
          tabBarIcon: () => <PulseIcon />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="browser"
        options={{
          title: t({
            id: 'tabs.home.browser',
            message: 'Browser',
          }),
          tabBarIcon: () => <BrowserIcon />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
