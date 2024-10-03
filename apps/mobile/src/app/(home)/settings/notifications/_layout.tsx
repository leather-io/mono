import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButtonHeader } from '@/components/headers/back-button';
import { SimpleHeader } from '@/components/headers/containers/simple-header';
import { TitleHeader } from '@/components/headers/title';
import { TabBar } from '@/components/tab-bar';
import { AppRoutes } from '@/routes';
import { t } from '@lingui/macro';
import { Tabs, router, usePathname, useRouter } from 'expo-router';

function HeaderBottomTabs() {
  const router = useRouter();
  const pathname = usePathname();
  return (
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
  );
}

export default function SettingsNotificationsLayout() {
  const insets = useSafeAreaInsets();

  const NavigationHeader = (
    <SimpleHeader
      insets={insets}
      left={<BackButtonHeader onPress={() => router.navigate(AppRoutes.Settings)} />}
      center={
        <TitleHeader
          title={t({
            id: 'notifications.header_title',
            message: 'Notifications',
          })}
        />
      }
      bottom={<HeaderBottomTabs />}
    />
  );

  return (
    <Tabs tabBar={() => null}>
      <Tabs.Screen
        name="index"
        options={{
          title: t({
            id: 'notifications.push.tab_title',
            message: 'Push',
          }),
          header: () => NavigationHeader,
        }}
      />
      <Tabs.Screen
        name="email"
        options={{
          title: t({
            id: 'notifications.email.tab_title',
            message: 'Email',
          }),
          header: () => NavigationHeader,
        }}
      />
    </Tabs>
  );
}
