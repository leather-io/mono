import { StatusBar } from 'react-native';

import { useSettings } from '@/store/settings/settings';
import { Slot } from 'expo-router';

import { Box } from '@leather.io/ui/native';

export function AppRouter() {
  const { whenTheme } = useSettings();
  return (
    <Box backgroundColor="ink.background-secondary" flex={1}>
      <StatusBar barStyle={whenTheme({ dark: 'light-content', light: 'dark-content' } as const)} />
      <Slot />
    </Box>
  );
}
