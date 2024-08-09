import { RefObject, createContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBarMethods } from '@/components/action-bar';
import { AccountHeader } from '@/components/headers/account';
import { BackButtonHeader } from '@/components/headers/back-button';
import { BlurredHeader } from '@/components/headers/containers/blurred-header';
import { SimpleHeader } from '@/components/headers/containers/simple-header';
import { LeatherLogoHeader } from '@/components/headers/leather-logo';
import { MenuHeader } from '@/components/headers/menu';
import { OptionsHeader } from '@/components/headers/options';
import { TitleHeader } from '@/components/headers/title';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Stack, useRouter } from 'expo-router';

export const ActionBarContext = createContext<{ ref: RefObject<ActionBarMethods> | null }>({
  ref: null,
});

export default function StackLayout() {
  // connect this component to changes in i18n locale
  useLingui();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const NavigationHeader = (
    <BlurredHeader
      insets={insets}
      left={<BackButtonHeader onPress={() => router.back()} />}
      center={<AccountHeader />}
      right={<MenuHeader />}
    />
  );

  const NavigationHeaderHome = (
    <SimpleHeader insets={insets} left={<LeatherLogoHeader />} right={<OptionsHeader />} />
  );

  const NavigationBackSimple = (
    <SimpleHeader insets={insets} left={<BackButtonHeader onPress={() => router.back()} />} />
  );

  const NavigationSettings = (
    <SimpleHeader
      insets={insets}
      left={<BackButtonHeader onPress={() => router.back()} />}
      center={<TitleHeader title={t`Settings`} />}
    />
  );

  const NavigationDeveloperConsole = (
    <SimpleHeader
      insets={insets}
      left={<BackButtonHeader onPress={() => router.back()} />}
      center={<TitleHeader title={t`Developer tools`} />}
    />
  );

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="send" options={{ header: () => NavigationHeader }} />
      <Stack.Screen name="receive" options={{ header: () => NavigationHeader }} />
      <Stack.Screen name="swap" options={{ header: () => NavigationHeader }} />
      <Stack.Screen name="browser" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ header: () => NavigationHeaderHome }} />
      <Stack.Screen name="create-new-wallet" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="recover-wallet" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="secure-your-wallet" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="settings/index" options={{ header: () => NavigationSettings }} />
      <Stack.Screen
        name="developer-console/index"
        options={{ header: () => NavigationDeveloperConsole }}
      />
      <Stack.Screen
        name="developer-console/wallet-manager"
        options={{ header: () => NavigationDeveloperConsole }}
      />
    </Stack>
  );
}
