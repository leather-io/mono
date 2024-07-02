import { RefObject, createContext, useRef } from 'react';

import ArrowLeft from '@/assets/arrow-left.svg';
import EmojiSmile from '@/assets/emoji-smile.svg';
import Inbox from '@/assets/inbox.svg';
import Menu from '@/assets/menu.svg';
import PaperPlane from '@/assets/paper-plane.svg';
import Swap from '@/assets/swap.svg';
import { ActionBar, ActionBarMethods } from '@/components/action-bar';
import { createBlurredHeader } from '@/components/blurred-header';
import { Trans } from '@lingui/macro';
import { Tabs } from 'expo-router';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

type BottomTabBarProps = Parameters<NonNullable<Parameters<typeof Tabs>[0]['tabBar']>>[0];

function createFilledActionBar(ref: RefObject<ActionBarMethods>) {
  return function ({ navigation: { navigate } }: BottomTabBarProps) {
    return (
      <ActionBar
        ref={ref}
        left={
          <TouchableOpacity
            onPress={() => navigate('send')}
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
            onPress={() => navigate('receive')}
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
            onPress={() => navigate('swap')}
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

export default function TabLayout() {
  const ref = useRef<ActionBarMethods>(null);

  const navigationHeader = createBlurredHeader({
    left: (
      <TouchableOpacity height={48} width={48} justifyContent="center" alignItems="center">
        <ArrowLeft height={24} width={24} />
      </TouchableOpacity>
    ),
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
  });
  return (
    <ActionBarContext.Provider value={{ ref }}>
      <Tabs tabBar={createFilledActionBar(ref)}>
        <Tabs.Screen
          name="send"
          options={{
            title: 'Send',
            header: navigationHeader,
          }}
        />
        <Tabs.Screen
          name="receive"
          options={{
            title: 'Receive',
            header: navigationHeader,
          }}
        />
        <Tabs.Screen
          name="swap"
          options={{
            title: 'Swap',
            header: navigationHeader,
          }}
        />
      </Tabs>
    </ActionBarContext.Provider>
  );
}