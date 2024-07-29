import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EmojiSmile from '@/assets/emoji-smile.svg';
import Menu from '@/assets/menu.svg';
import { ActionBarMethods } from '@/components/action-bar';
import { createBlurredHeader } from '@/components/blurred-header';
import { Modal } from '@/components/bottom-sheet-modal';
import { TabBar } from '@/components/tab-bar';
import { APP_ROUTES } from '@/constants';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Tabs, usePathname, useRouter } from 'expo-router';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

import { ActionBarContainer, ActionBarContext } from './action-bar';

function HeaderCenter({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      height={48}
      px="3"
      flexDirection="row"
      alignItems="center"
      gap="2"
    >
      <Box borderRadius="round" p="1" bg="base.blue.background-secondary">
        <EmojiSmile width={24} height={24} />
      </Box>
      <Text variant="heading05">Account 1</Text>
    </TouchableOpacity>
  );
}

function HeaderRight({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      height={48}
      width={48}
      justifyContent="center"
      alignItems="center"
    >
      <Menu height={24} width={24} />
    </TouchableOpacity>
  );
}

function HeaderBottom() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <TabBar
      tabs={[
        {
          onPress() {
            router.navigate(APP_ROUTES.WalletAllAssets);
          },
          title: 'All assets',
          isActive: pathname === APP_ROUTES.WalletAllAssets,
        },
        {
          onPress() {
            router.navigate(APP_ROUTES.WalletTokens);
          },
          title: 'Tokens',
          isActive: pathname === APP_ROUTES.WalletTokens,
        },
        {
          onPress() {
            router.navigate(APP_ROUTES.WalletCollectibles);
          },
          title: 'Collectibles',
          isActive: pathname === APP_ROUTES.WalletCollectibles,
        },
      ]}
    />
  );
}

export default function TabLayout() {
  const ref = useRef<ActionBarMethods>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const NavigationHeader = createBlurredHeader({
    insets,
    center: <HeaderCenter />,
    right: (
      <HeaderRight
        onPress={() => {
          bottomSheetModalRef.current?.present();
        }}
      />
    ),
    bottom: <HeaderBottom />,
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
      <ActionBarContainer ref={ref} />
      <Modal ref={bottomSheetModalRef}>
        <Text>Dummy modal text 🎉 Add blocks to see responsive modal</Text>
      </Modal>
    </ActionBarContext.Provider>
  );
}
