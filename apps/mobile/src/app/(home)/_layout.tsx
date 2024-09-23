import { RefObject, createContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBarMethods } from '@/components/action-bar';
import { AccountsHeader } from '@/components/headers/account';
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

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

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
      center={<AccountsHeader />}
      right={<MenuHeader />}
    />
  );

  const NavigationHeaderHome = (
    <SimpleHeader insets={insets} left={<LeatherLogoHeader />} right={<OptionsHeader />} />
  );

  const NavigationBackSimple = (
    <SimpleHeader insets={insets} left={<BackButtonHeader onPress={() => router.back()} />} />
  );

  function NavigationSettings(title: string = t`Settings`) {
    return (
      <SimpleHeader
        insets={insets}
        left={<BackButtonHeader onPress={() => router.back()} />}
        center={<TitleHeader title={title} />}
      />
    );
  }

  function WalletNavigationSettings(title: string = t`Settings`) {
    return (
      <SimpleHeader
        insets={insets}
        left={<BackButtonHeader onPress={() => router.back()} />}
        center={<TitleHeader title={title} />}
        right={
          <TouchableOpacity
            px="3"
            onPress={() => {
              // TODO: open network settings
              // either modal or screen
            }}
          >
            <Box
              p="1"
              bg="ink.background-secondary"
              borderWidth={1}
              borderColor="ink.border-transparent"
              borderRadius="xs"
            >
              <Text variant="label03" color="ink.text-subdued">
                {t`Testnet`}
              </Text>
            </Box>
          </TouchableOpacity>
        }
      />
    );
  }

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
      <Stack.Screen name="index" options={{ header: () => NavigationHeaderHome }} />
      <Stack.Screen name="create-new-wallet" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="recover-wallet" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="secure-your-wallet" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="settings/index" options={{ header: () => NavigationSettings() }} />
      <Stack.Screen
        name="settings/display/index"
        options={{ header: () => NavigationSettings(t`Display`) }}
      />
      <Stack.Screen
        name="settings/security/index"
        options={{ header: () => NavigationSettings(t`Security`) }}
      />
      <Stack.Screen
        name="settings/networks/index"
        options={{ header: () => NavigationSettings(t`Networks`) }}
      />
      <Stack.Screen
        name="settings/notifications/index"
        options={{ header: () => NavigationSettings(t`Notifications`) }}
      />
      <Stack.Screen
        name="settings/help/index"
        options={{ header: () => NavigationSettings(t`Help`) }}
      />
      <Stack.Screen
        name="settings/wallet/index"
        options={{ header: () => WalletNavigationSettings() }}
      />
      <Stack.Screen
        name="settings/wallet/hidden-accounts"
        options={{ header: () => WalletNavigationSettings() }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/[account]/index"
        options={{ header: props => WalletNavigationSettings(props.options.title) }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/[account]/choose-avatar"
        options={{ header: () => NavigationBackSimple }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/index"
        options={{
          header: props => WalletNavigationSettings(props.options.title),
        }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/view-secret-key"
        options={{ header: () => NavigationBackSimple }}
      />
      <Stack.Screen
        name="developer-console/index"
        options={{ header: () => NavigationDeveloperConsole }}
      />
      <Stack.Screen
        name="developer-console/wallet-manager"
        options={{ header: () => NavigationDeveloperConsole }}
      />
      <Stack.Screen
        name="developer-console/bitcoin-scratch-pad"
        options={{ header: () => NavigationDeveloperConsole }}
      />
      <Stack.Screen name="generating-wallet" options={{ headerShown: false }} />
    </Stack>
  );
}
