import { RefObject, createContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBarMethods } from '@/components/action-bar';
import { BackButtonHeader } from '@/components/headers/back-button';
import { SimpleHeader } from '@/components/headers/containers/simple-header';
import { LeatherLogoHeader } from '@/components/headers/leather-logo';
import { OptionsHeader } from '@/components/headers/options';
import { TitleHeader } from '@/components/headers/title';
import { TestId } from '@/shared/test-id';
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

  // const NavigationHeader = (
  //   <BlurredHeader
  //     insets={insets}
  //     left={<BackButtonHeader onPress={() => router.back()} />}
  //     center={<AccountsHeader />}
  //     right={<MenuHeader />}
  //   />
  // );

  const NavigationHeaderHome = (
    <SimpleHeader insets={insets} left={<LeatherLogoHeader />} right={<OptionsHeader />} />
  );

  const NavigationBackSimple = (
    <SimpleHeader
      insets={insets}
      left={<BackButtonHeader onPress={() => router.back()} testID={TestId.backButton} />}
    />
  );

  function NavigationSettings(
    title: string = t({
      id: 'settings.header_title',
      message: 'Settings',
    })
  ) {
    return (
      <SimpleHeader
        insets={insets}
        left={<BackButtonHeader onPress={() => router.back()} />}
        center={<TitleHeader title={title} />}
      />
    );
  }

  function WalletNavigationSettings(
    title: string = t({
      id: 'settings.header_title',
      message: 'Settings',
    })
  ) {
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
                {t({
                  id: 'settings.header_network',
                  message: 'Testnet',
                })}
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
      left={<BackButtonHeader onPress={() => router.back()} testID={TestId.backButton} />}
      center={
        <TitleHeader
          title={t({
            id: 'developer_console.header_title',
            message: 'Developer tools',
          })}
        />
      }
    />
  );

  return (
    <Stack>
      {/* TODO: Can these be removed, or they should go after index route? */}
      {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="send" options={{ header: () => NavigationHeader }} />
      <Stack.Screen name="receive" options={{ header: () => NavigationHeader }} />
      <Stack.Screen name="swap" options={{ header: () => NavigationHeader }} />
      <Stack.Screen name="browser" options={{ headerShown: false }} /> */}
      <Stack.Screen name="index" options={{ header: () => NavigationHeaderHome }} />
      <Stack.Screen name="create-new-wallet" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="recover-wallet" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="secure-your-wallet" options={{ header: () => NavigationBackSimple }} />

      <Stack.Screen
        name="account/[account]/index"
        options={{ header: () => NavigationBackSimple }}
      />
      <Stack.Screen name="settings/index" options={{ header: () => NavigationSettings() }} />
      <Stack.Screen
        name="settings/display/index"
        options={{
          header: () =>
            NavigationSettings(
              t({
                id: 'display.header_title',
                message: 'Display',
              })
            ),
        }}
      />
      <Stack.Screen
        name="settings/security/index"
        options={{
          header: () =>
            NavigationSettings(
              t({
                id: 'security.header_title',
                message: 'Security',
              })
            ),
        }}
      />
      <Stack.Screen
        name="settings/networks/index"
        options={{
          header: () =>
            NavigationSettings(
              t({
                id: 'networks.header_title',
                message: 'Networks',
              })
            ),
        }}
      />
      <Stack.Screen name="settings/notifications" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings/help/index"
        options={{
          header: () =>
            NavigationSettings(
              t({
                id: 'help.header_title',
                message: 'Help',
              })
            ),
        }}
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
      <Stack.Screen name="mpc-wallets" options={{ header: () => NavigationBackSimple }} />
      <Stack.Screen name="hardware-wallets" options={{ header: () => NavigationBackSimple }} />
    </Stack>
  );
}
