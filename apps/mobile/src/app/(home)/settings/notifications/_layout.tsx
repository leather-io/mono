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
          onPress() {
            router.navigate(AppRoutes.SettingsNotifications);
          },
          title: t`Push`,
          isActive: pathname === AppRoutes.SettingsNotifications,
        },
        {
          onPress() {
            router.navigate(AppRoutes.SettingsNotificationsEmail);
          },
          title: t`Email`,
          isActive: pathname === AppRoutes.SettingsNotificationsEmail,
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
      center={<TitleHeader title={t`Notifications`} />}
      bottom={<HeaderBottomTabs />}
    />
  );

  return (
    <Tabs tabBar={() => null}>
      <Tabs.Screen
        name="index"
        options={{
          title: t`Push`,
          header: () => NavigationHeader,
        }}
      />
      <Tabs.Screen
        name="email"
        options={{
          title: t`Email`,
          header: () => NavigationHeader,
        }}
      />
    </Tabs>
  );
}
