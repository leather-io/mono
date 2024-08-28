import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBarMethods } from '@/components/action-bar';
import { ActionBarContainer, ActionBarContext } from '@/components/action-bar/container';
import { Modal } from '@/components/bottom-sheet-modal';
import { BlurredHeader } from '@/components/headers/containers/blurred-header';
import { TabBar } from '@/components/tab-bar';
import { APP_ROUTES } from '@/routes';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { Tabs, usePathname, useRouter } from 'expo-router';

import { BarsTwoIcon, Box, EmojiSmileIcon, Text, TouchableOpacity } from '@leather.io/ui/native';

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
      <Box borderRadius="round" p="1" bg="blue.background-secondary">
        <EmojiSmileIcon />
      </Box>
      <Text variant="heading05">{t`Account 1`}</Text>
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
      <BarsTwoIcon />
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
          title: t`All assets`,
          isActive: pathname === APP_ROUTES.WalletAllAssets,
        },
        {
          onPress() {
            router.navigate(APP_ROUTES.WalletTokens);
          },
          title: t`Tokens`,
          isActive: pathname === APP_ROUTES.WalletTokens,
        },
        {
          onPress() {
            router.navigate(APP_ROUTES.WalletCollectibles);
          },
          title: t`Collectibles`,
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
  const NavigationHeader = (
    <BlurredHeader
      insets={insets}
      center={<HeaderCenter />}
      right={
        <HeaderRight
          onPress={() => {
            bottomSheetModalRef.current?.present();
          }}
        />
      }
      bottom={<HeaderBottom />}
    />
  );

  return (
    <ActionBarContext.Provider value={{ ref }}>
      <Tabs tabBar={() => null}>
        <Tabs.Screen
          name="all-assets"
          options={{
            title: t`All Assets`,
            header: () => NavigationHeader,
          }}
        />
        <Tabs.Screen
          name="collectibles"
          options={{
            title: t`Collectibles`,
            header: () => NavigationHeader,
          }}
        />
        <Tabs.Screen
          name="tokens"
          options={{
            title: t`Tokens`,
            header: () => NavigationHeader,
          }}
        />
      </Tabs>
      <ActionBarContainer ref={ref} />
      <Modal ref={bottomSheetModalRef}>
        <Text>{t`Dummy modal text 🎉 Add blocks to see responsive modal`}</Text>
      </Modal>
    </ActionBarContext.Provider>
  );
}
