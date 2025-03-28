import { StatusBar as NativeStatusBar } from 'react-native';

import { useSettings } from '@/store/settings/settings';

export function StatusBar() {
  const { whenTheme } = useSettings();

  return (
    <NativeStatusBar
      barStyle={whenTheme({
        dark: 'light-content',
        light: 'dark-content',
      } as const)}
    />
  );
}
