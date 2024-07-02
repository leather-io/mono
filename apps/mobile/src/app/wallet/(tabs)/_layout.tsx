import { RefObject, createContext, useRef } from 'react';

import EmojiSmile from '@/assets/emoji-smile.svg';
import Inbox from '@/assets/inbox.svg';
import Menu from '@/assets/menu.svg';
import PaperPlane from '@/assets/paper-plane.svg';
import Swap from '@/assets/swap.svg';
import { ActionBar, ActionBarMethods } from '@/components/action-bar';
import { createBlurredHeader } from '@/components/blurred-header';
import { APP_ROUTES } from '@/constants';
import { Trans } from '@lingui/macro';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { ExpoRouter } from 'expo-router/types/expo-router';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

function createFilledActionBar(ref: RefObject<ActionBarMethods>, router: ExpoRouter.Router) {
  return function () {
    return (
      <ActionBar
        ref={ref}
        left={
          <TouchableOpacity
            onPress={() => router.navigate(APP_ROUTES.WalletSend)}
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            flex={1}
            height="100%"
            gap="2"
          >
            <PaperPlane width={24} height={24} />
            <Text variant="label02">
              <Trans>Send</Trans>
            </Text>
          </TouchableOpacity>
        }
        center={
          <TouchableOpacity
            onPress={() => router.navigate(APP_ROUTES.WalletReceive)}
            justifyContent="center"
            alignItems="center"
            flex={1}
            height="100%"
            flexDirection="row"
            gap="2"
          >
            <Inbox width={24} height={24} />
            <Text variant="label02">
              <Trans>Receive</Trans>
            </Text>
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity
            onPress={() => router.navigate(APP_ROUTES.WalletSwap)}
            justifyContent="center"
            flex={1}
            height="100%"
            alignItems="center"
            flexDirection="row"
            gap="2"
          >
            <Swap width={24} height={24} />
            <Text variant="label02">
              <Trans>Swap</Trans>
            </Text>
          </TouchableOpacity>
        }
      />
    );
  };
}

export const ActionBarContext = createContext<{ ref: RefObject<ActionBarMethods> | null }>({
  ref: null,
});

function getBorderColor(isSelected: boolean) {
  return isSelected ? 'base.ink.action-primary-default' : 'base.ink.border-default';
}

export const TAB_BAR_HEIGHT = 60;

export default function TabLayout() {
  const ref = useRef<ActionBarMethods>(null);

  const router = useRouter();
  const pathname = usePathname();

  const NavigationHeader = createBlurredHeader({
    center: (
      <TouchableOpacity height={48} px="3" flexDirection="row" alignItems="center" gap="2">
        <Box borderRadius="round" p="1" bg="base.blue.background-secondary">
          <EmojiSmile width={24} height={24} />
        </Box>
        <Text variant="heading05">Account 1</Text>
      </TouchableOpacity>
    ),
    right: (
      <TouchableOpacity height={48} width={48} justifyContent="center" alignItems="center">
        <Menu height={24} width={24} />
      </TouchableOpacity>
    ),
    bottom: (
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        height={TAB_BAR_HEIGHT}
      >
        <TouchableOpacity
          onPress={() => router.navigate(APP_ROUTES.WalletAllAssets)}
          height="100%"
          flex={1}
          alignItems="center"
          justifyContent="center"
          borderBottomWidth={4}
          borderColor={getBorderColor(pathname === APP_ROUTES.WalletAllAssets)}
        >
          <Text variant="label01">All assets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.navigate(APP_ROUTES.WalletTokens)}
          height="100%"
          flex={1}
          alignItems="center"
          justifyContent="center"
          borderBottomWidth={4}
          borderColor={getBorderColor(pathname === APP_ROUTES.WalletTokens)}
        >
          <Text variant="label01">Tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.navigate(APP_ROUTES.WalletCollectibles)}
          height="100%"
          flex={1}
          alignItems="center"
          justifyContent="center"
          borderBottomWidth={4}
          borderColor={getBorderColor(pathname === APP_ROUTES.WalletCollectibles)}
        >
          <Text variant="label01">Collectibles</Text>
        </TouchableOpacity>
      </Box>
    ),
  });
  return (
    <ActionBarContext.Provider value={{ ref }}>
      <Tabs tabBar={() => null}>
        <Tabs.Screen
          name="all-assets"
          options={{
            title: 'All Assets',
            header: NavigationHeader,
          }}
        />
        <Tabs.Screen
          name="collectibles"
          options={{
            title: 'Collectibles',
            header: NavigationHeader,
          }}
        />
        <Tabs.Screen
          name="tokens"
          options={{
            title: 'Tokens',
            header: NavigationHeader,
          }}
        />
      </Tabs>
      {createFilledActionBar(ref, router)()}
    </ActionBarContext.Provider>
  );
}
