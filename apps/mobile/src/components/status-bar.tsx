import { StatusBar as NativeStatusBar } from 'react-native';

import { useSettings } from '@/store/settings/settings';

import { useTheme } from '@leather.io/ui/native';

export function StatusBar() {
  const { whenTheme } = useSettings();
  const theme = useTheme();

  return (
    <NativeStatusBar
      barStyle={whenTheme({
        dark: 'light-content',
        light: 'dark-content',
      } as const)}
      backgroundColor={theme.colors['ink.background-primary']}
    />
  );
}
