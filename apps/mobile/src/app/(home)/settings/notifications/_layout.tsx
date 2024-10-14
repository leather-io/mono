import { TabsHeader } from '@/components/headers/tabs-header';
import { NetworkBadge } from '@/components/network-badge';
import { AppRoutes } from '@/routes';
import { t } from '@lingui/macro';
import { Tabs, usePathname, useRouter } from 'expo-router';

function NotificationsHeader() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <TabsHeader
      onGoBack={() => router.navigate(AppRoutes.Settings)}
      rightElement={<NetworkBadge />}
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
      title={t({
        id: 'notifications.header_title',
        message: 'Notifications',
      })}
    />
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
