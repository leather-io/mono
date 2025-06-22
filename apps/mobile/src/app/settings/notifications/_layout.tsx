import { Screen } from '@/components/screen/screen';
import { TabBar } from '@/components/tab-bar';
import { t } from '@lingui/macro';
import { Tabs, usePathname, useRouter } from 'expo-router';

export default function SettingsNotificationsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Screen>
      <Screen.Header />
      <Screen.Title>
        {t({
          id: 'notifications.header_title',
          message: 'Notifications',
        })}
      </Screen.Title>

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

      <Tabs tabBar={() => null} backBehavior="none">
        <Tabs.Screen
          name="index"
          options={{
            title: t({
              id: 'notifications.push.tab_title',
              message: 'Push',
            }),
            header: () => null,
          }}
        />
        <Tabs.Screen
          name="email"
          options={{
            title: t({
              id: 'notifications.email.tab_title',
              message: 'Email',
            }),
            header: () => null,
          }}
        />
      </Tabs>
    </Screen>
  );
}
