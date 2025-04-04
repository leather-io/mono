import { HomeHeader } from '@/components/headers/home-header';
import { NakedHeader } from '@/components/headers/naked-header';
import { NetworkBadge } from '@/features/settings/network-badge';
import { AppRoutes } from '@/routes';
import { useLingui } from '@lingui/react';
import { Stack, useRouter } from 'expo-router';

export function AppNavigationStack() {
  useLingui();
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: () => <HomeHeader /> }} />
      <Stack.Screen name="generating-wallet" options={{ headerShown: false }} />
      <Stack.Screen name="swap" options={{ header: () => <NakedHeader /> }} />

      {/* Account */}
      <Stack.Screen name="account/[account]/index" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen name="account/[account]/activity" options={{ headerShown: false }} />
      <Stack.Screen name="account/[account]/collectibles" options={{ headerShown: false }} />
      <Stack.Screen name="account/[account]/balances" options={{ headerShown: false }} />
      <Stack.Screen name="balances/index" options={{ headerShown: false }} />

      {/* Activity */}
      <Stack.Screen name="activity/index" options={{ headerShown: false }} />

      {/* Collectibles */}
      <Stack.Screen name="collectibles/index" options={{ headerShown: false }} />

      {/* Developer Console */}
      <Stack.Screen name="developer-console/index" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen
        name="developer-console/wallet-manager"
        options={{ header: () => <NakedHeader /> }}
      />
      <Stack.Screen
        name="developer-console/bitcoin-scratch-pad"
        options={{ header: () => <NakedHeader /> }}
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
      <Stack.Screen name="restore-wallet" options={{ headerShown: false }} />
      <Stack.Screen name="secure-your-wallet" options={{ headerShown: false }} />
    </Stack>
  );
}
