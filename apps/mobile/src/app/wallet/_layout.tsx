import { RefObject, createContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ArrowLeft from '@/assets/arrow-left.svg';
import EmojiSmile from '@/assets/emoji-smile.svg';
import Menu from '@/assets/menu.svg';
import { ActionBarMethods } from '@/components/action-bar';
import { createBlurredHeader } from '@/components/blurred-header';
import { Stack, useRouter } from 'expo-router';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export const ActionBarContext = createContext<{ ref: RefObject<ActionBarMethods> | null }>({
  ref: null,
});

function HeaderLeft({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      height={48}
      width={48}
      justifyContent="center"
      alignItems="center"
    >
      <ArrowLeft height={24} width={24} />
    </TouchableOpacity>
  );
}

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
export default function StackLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const NavigationHeader = createBlurredHeader({
    insets,
    left: <HeaderLeft onPress={() => router.back()} />,
    center: <HeaderCenter />,
    right: <HeaderRight />,
  });
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="send" options={{ header: NavigationHeader }} />
      <Stack.Screen name="receive" options={{ header: NavigationHeader }} />
      <Stack.Screen name="swap" options={{ header: NavigationHeader }} />
      <Stack.Screen name="browser" options={{ headerShown: false }} />
    </Stack>
  );
}
