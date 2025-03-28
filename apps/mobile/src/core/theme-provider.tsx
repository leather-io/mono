import { useSettings } from '@/store/settings/settings';

import { HasChildren, ThemeProvider as LeatherThemeProvider } from '@leather.io/ui/native';

export function ThemeProvider({ children }: HasChildren) {
  const { themeDerivedFromThemePreference } = useSettings();
  return (
    <LeatherThemeProvider theme={themeDerivedFromThemePreference}>{children}</LeatherThemeProvider>
  );
}
