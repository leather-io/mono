import { Tabs } from 'expo-router';

import { Box } from '@leather.io/ui/native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="(index)"
        options={{
          tabBarIcon: () => <Box width={28} height={28} bg="red.border" />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="browser"
        options={{
          tabBarIcon: () => <Box width={28} height={28} bg="red.border" />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: () => <Box width={28} height={28} bg="red.border" />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
