import { useSettings } from '@/store/settings/settings';
import { HasChildren } from '@/utils/types';

import { ThemeProvider } from '@leather.io/ui/native';

export function LeatherThemeProvider({ children }: HasChildren) {
  const { themeDerivedFromThemePreference } = useSettings();
  return <ThemeProvider theme={themeDerivedFromThemePreference}>{children}</ThemeProvider>;
}
