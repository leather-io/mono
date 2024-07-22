import { RefObject, createContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBarMethods } from '@/components/action-bar';
import { createBlurredHeader } from '@/components/blurred-header';
import { AccountHeader } from '@/components/headers/account';
import { BackButtonHeader } from '@/components/headers/back-button';
import { LeatherLogoHeader } from '@/components/headers/leather-logo';
import { MenuHeader } from '@/components/headers/menu';
import { OptionsHeader } from '@/components/headers/options';
import { TitleHeader } from '@/components/headers/title';
import { APP_ROUTES } from '@/constants';
import { Stack, useRouter } from 'expo-router';

export const ActionBarContext = createContext<{ ref: RefObject<ActionBarMethods> | null }>({
  ref: null,
});

export default function StackLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const NavigationHeader = createBlurredHeader({
    insets,
    left: <BackButtonHeader onPress={() => router.back()} />,
    center: <AccountHeader />,
    right: <MenuHeader />,
  });
  const NavigationHeaderHome = createBlurredHeader({
    insets,
    left: <LeatherLogoHeader />,
    right: <OptionsHeader onPress={() => router.navigate(APP_ROUTES.WalletDeveloperConsole)} />,
  });
  const NavigationDeveloperConsole = createBlurredHeader({
    insets,
    left: <BackButtonHeader onPress={() => router.back()} />,
    center: <TitleHeader title="Developer tools" />,
  });
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="send" options={{ header: NavigationHeader }} />
      <Stack.Screen name="receive" options={{ header: NavigationHeader }} />
      <Stack.Screen name="swap" options={{ header: NavigationHeader }} />
      <Stack.Screen name="browser" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ header: NavigationHeaderHome }} />
      <Stack.Screen name="developer-console" options={{ header: NavigationDeveloperConsole }} />
    </Stack>
  );
}
