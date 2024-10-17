import { TabBar } from '@/components/tab-bar';
import { AppRoutes } from '@/routes';
import { t } from '@lingui/macro';
import { Tabs, usePathname, useRouter } from 'expo-router';

import { Box, Text } from '@leather.io/ui/native';

function NotificationsHeader() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <Box bg="ink.background-primary" paddingBottom="5" paddingHorizontal="5">
        <Text fontWeight={800} variant="heading03">
          {t({
            id: 'notifications.header_title',
            message: 'Notifications',
          })}
        </Text>
      </Box>
      <TabBar
        tabs={[
          {
            isActive: pathname === AppRoutes.SettingsNotifications,
            onPress() {
              router.navigate(AppRoutes.SettingsNotifications);
            },
            title: t({
              id: 'notifications.push.tab_title',
              message: 'Push',
            }),
          },
          {
            isActive: pathname === AppRoutes.SettingsNotificationsEmail,
            onPress() {
              router.navigate(AppRoutes.SettingsNotificationsEmail);
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
