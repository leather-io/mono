import { RefObject, createContext } from 'react';

import { ActionBarMethods } from '@/components/action-bar';
import { HomeHeader } from '@/components/headers/home-header';
import { NakedHeader } from '@/components/headers/naked-header';
import { TitleHeader } from '@/components/headers/title-header';
import { NetworkBadge } from '@/components/network-badge';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Stack } from 'expo-router';

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

function SettingsHeader({
  title = t({
    id: 'settings.header_title',
    message: 'Settings',
  }),
}: {
  title?: string;
}) {
  return <TitleHeader rightElement={<NetworkBadge />} title={title} />;
}

export default function StackLayout() {
  useLingui();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: () => <HomeHeader /> }} />
      <Stack.Screen name="browser" options={{ headerShown: false }} />
      <Stack.Screen name="create-new-wallet" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen name="generating-wallet" options={{ headerShown: false }} />
      <Stack.Screen name="hardware-wallets" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen name="mpc-wallets" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen name="receive" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen name="recover-wallet" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen name="secure-your-wallet" options={{ header: () => <NakedHeader /> }} />
      <Stack.Screen name="send" options={{ header: () => <NakedHeader /> }} />
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
      <Stack.Screen name="settings/index" options={{ header: () => <SettingsHeader /> }} />
      <Stack.Screen
        name="settings/display/index"
        options={{
          header: () => (
            <SettingsHeader
              title={t({
                id: 'display.header_title',
                message: 'Display',
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name="settings/security/index"
        options={{
          header: () => (
            <SettingsHeader
              title={t({
                id: 'security.header_title',
                message: 'Security',
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name="settings/networks/index"
        options={{
          header: () => (
            <SettingsHeader
              title={t({
                id: 'networks.header_title',
                message: 'Networks',
              })}
            />
          ),
        }}
      />
      <Stack.Screen name="settings/notifications" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings/help/index"
        options={{
          header: () => (
            <SettingsHeader
              title={t({
                id: 'help.header_title',
                message: 'Help',
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name="settings/wallet/index"
        options={{
          header: () => (
            <SettingsHeader
              title={t({
                id: 'wallets.header_title',
                message: 'Wallets',
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name="settings/wallet/hidden-accounts"
        options={{
          header: () => (
            <SettingsHeader
              title={t({
                id: 'hidden_accounts.header_title',
                message: 'Hidden accounts',
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/[account]/index"
        options={{ header: props => <SettingsHeader title={props.options.title} /> }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/[account]/choose-avatar"
        options={{ header: () => <NakedHeader /> }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/index"
        options={{
          header: props => <SettingsHeader title={props.options.title} />,
        }}
      />
      <Stack.Screen
        name="settings/wallet/configure/[wallet]/view-secret-key"
        options={{ header: () => <NakedHeader /> }}
      />
    </Stack>
  );
}
