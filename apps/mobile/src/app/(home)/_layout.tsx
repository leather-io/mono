import { RefObject, createContext } from 'react';

import { ActionBarMethods } from '@/components/action-bar/action-bar';
import { HomeHeader } from '@/components/headers/home-header';
import { NakedHeader } from '@/components/headers/naked-header';
import { TitleHeader } from '@/components/headers/title-header';
import { NetworkBadge } from '@/features/settings/network-badge';
import { AppRoutes } from '@/routes';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Stack, useRouter } from 'expo-router';

export const ActionBarContext = createContext<{ ref: RefObject<ActionBarMethods> | null }>({
  ref: null,
});

function DeveloperConsoleHeader() {
  return (
    <TitleHeader
      title={t({
        id: 'developer_console.header_title',
        message: 'Developer tools',
      })}
    />
  );
}

export default function StackLayout() {
  useLingui();
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: () => <HomeHeader /> }} />
      <Stack.Screen name="browser" options={{ headerShown: false }} />
      <Stack.Screen name="generating-wallet" options={{ headerShown: false }} />
      <Stack.Screen name="receive" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen name="swap" options={{ header: () => <NakedHeader /> }} />

      {/* Account */}
      <Stack.Screen name="account/[account]/index" options={{ header: () => <NakedHeader /> }} />

      {/* Developer Console */}
      <Stack.Screen
        name="developer-console/index"
        options={{
          header: () => <DeveloperConsoleHeader />,
        }}
      />
      <Stack.Screen
        name="developer-console/wallet-manager"
        options={{
          header: () => <DeveloperConsoleHeader />,
        }}
      />
      <Stack.Screen
        name="developer-console/bitcoin-scratch-pad"
        options={{
          header: () => <DeveloperConsoleHeader />,
        }}
      />

      {/* Settings */}
      <Stack.Screen name="settings/index" options={{ headerShown: false }} />
      <Stack.Screen name="settings/display/index" options={{ headerShown: false }} />
      <Stack.Screen name="settings/security/index" options={{ headerShown: false }} />
      <Stack.Screen name="settings/networks/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings/notifications"
        options={{
          header: () => (
            <NakedHeader
              onGoBack={() => router.navigate(AppRoutes.Settings)}
              rightElement={<NetworkBadge />}
            />
          ),
        }}
      />
      <Stack.Screen name="settings/help/index" options={{ headerShown: false }} />
      <Stack.Screen name="settings/wallet/index" options={{ headerShown: false }} />
      <Stack.Screen name="settings/wallet/hidden-accounts" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/[account]/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/[account]/choose-avatar"
        options={{ header: () => <NakedHeader /> }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/view-secret-key"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="create-new-wallet" options={{ headerShown: false }} />
      <Stack.Screen name="hardware-wallets" options={{ headerShown: false }} />
      <Stack.Screen name="mpc-wallets" options={{ headerShown: false }} />
      <Stack.Screen name="recover-wallet" options={{ headerShown: false }} />
      <Stack.Screen name="secure-your-wallet" options={{ headerShown: false }} />
    </Stack>
  );
}
