import { RefObject, createContext } from 'react';

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

export default function StackLayout() {
  const router = useRouter();

  const leftComponent = (
    <TouchableOpacity
      onPress={() => router.back()}
      height={48}
      width={48}
      justifyContent="center"
      alignItems="center"
    >
      <ArrowLeft height={24} width={24} />
    </TouchableOpacity>
  );

  const centerComponent = (
    <TouchableOpacity height={48} px="3" flexDirection="row" alignItems="center" gap="2">
      <Box borderRadius="round" p="1" bg="base.blue.background-secondary">
        <EmojiSmile width={24} height={24} />
      </Box>
      <Text variant="heading05">Account 1</Text>
    </TouchableOpacity>
  );

  const rightComponent = (
    <TouchableOpacity height={48} width={48} justifyContent="center" alignItems="center">
      <Menu height={24} width={24} />
    </TouchableOpacity>
  );

  const NavigationHeader = createBlurredHeader({
    left: leftComponent,
    center: centerComponent,
    right: rightComponent,
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
