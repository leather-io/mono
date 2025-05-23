import { TabBar } from '@/components/tab-bar';
import { t } from '@lingui/macro';
import { Tabs, usePathname, useRouter } from 'expo-router';

import { Box, Text } from '@leather.io/ui/native';

function NotificationsHeader() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <Box bg="ink.background-primary" paddingBottom="5" paddingHorizontal="5">
        <Text variant="heading03">
          {t({
            id: 'notifications.header_title',
            message: 'Notifications',
          })}
        </Text>
      </Box>
      <TabBar
        tabs={[
          {
            isActive: pathname === '/settings/notifications',
            onPress() {
              router.navigate('/settings/notifications');
            },
            title: t({
              id: 'notifications.push.tab_title',
              message: 'Push',
            }),
          },
          {
            isActive: pathname === '/settings/notifications/email',
            onPress() {
              router.navigate('/settings/notifications/email');
            },
            title: t({
              id: 'notifications.email.tab_title',
              message: 'Email',
            }),
          },
        ]}
      />
    </>
  );
}

export default function SettingsNotificationsLayout() {
  return (
    <Tabs tabBar={() => null}>
      <Tabs.Screen
        name="index"
        options={{
          title: t({
            id: 'notifications.push.tab_title',
            message: 'Push',
          }),
          header: () => <NotificationsHeader />,
        }}
      />
      <Tabs.Screen
        name="email"
        options={{
          title: t({
            id: 'notifications.email.tab_title',
            message: 'Email',
          }),
          header: () => <NotificationsHeader />,
        }}
      />
    </Tabs>
  );
}
