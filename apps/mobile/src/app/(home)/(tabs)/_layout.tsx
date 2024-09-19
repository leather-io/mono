import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBarMethods } from '@/components/action-bar';
import { ActionBarContainer, ActionBarContext } from '@/components/action-bar/container';
import { BlurredHeader } from '@/components/headers/containers/blurred-header';
import { TabBar } from '@/components/tab-bar';
import { AppRoutes } from '@/routes';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { Tabs, usePathname, useRouter } from 'expo-router';

import {
  BarsTwoIcon,
  Box,
  EmojiSmileIcon,
  Sheet,
  SheetRef,
  Text,
  TouchableOpacity,
} from '@leather.io/ui/native';

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
            router.navigate(AppRoutes.AllAssets);
          },
          title: t`All assets`,
          isActive: pathname === AppRoutes.AllAssets,
        },
        {
          onPress() {
            router.navigate(AppRoutes.Tokens);
          },
          title: t`Tokens`,
          isActive: pathname === AppRoutes.Tokens,
        },
        {
          onPress() {
            router.navigate(AppRoutes.Collectibles);
          },
          title: t`Collectibles`,
          isActive: pathname === AppRoutes.Collectibles,
        },
      ]}
    />
  );
}

export default function TabLayout() {
  const ref = useRef<ActionBarMethods>(null);
  const bottomSheetRef = useRef<SheetRef>(null);
  const insets = useSafeAreaInsets();
  const { themeDerivedFromThemePreference } = useSettings();
  const NavigationHeader = (
    <BlurredHeader
      insets={insets}
      center={<HeaderCenter />}
      right={
        <HeaderRight
          onPress={() => {
            bottomSheetRef.current?.present();
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
      <Sheet ref={bottomSheetRef} themeVariant={themeDerivedFromThemePreference}>
        <Text>{t`Dummy modal text 🎉 Add blocks to see responsive modal`}</Text>
      </Sheet>
    </ActionBarContext.Provider>
  );
}
