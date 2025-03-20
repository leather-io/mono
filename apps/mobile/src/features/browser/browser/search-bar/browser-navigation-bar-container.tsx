import { ReactNode, useMemo } from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings';
import { useTheme } from '@shopify/restyle';

import { BlurView, Box, Theme } from '@leather.io/ui/native';

interface BrowserNavigationBarContainerProps {
  children: ReactNode;
}

export function BrowserNavigationBarContainer({ children }: BrowserNavigationBarContainerProps) {
  const theme = useTheme<Theme>();
  const { bottom } = useSafeAreaInsets();
  const { themeDerivedFromThemePreference } = useSettings();

  const searchBarContainerStyle = useMemo(
    () =>
      ({
        width: '100%',
        paddingHorizontal: theme.spacing['5'],
        paddingTop: theme.spacing['4'],
        paddingBottom: theme.spacing['4'] + bottom,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
      }) satisfies StyleProp<ViewStyle>,
    [bottom, theme.spacing]
  );

  switch (Platform.OS) {
    case 'android':
      return (
        <Box backgroundColor="ink.background-primary" style={searchBarContainerStyle}>
          {children}
        </Box>
      );
    case 'ios':
      return (
        <BlurView themeVariant={themeDerivedFromThemePreference} style={searchBarContainerStyle}>
          {children}
        </BlurView>
      );
    default:
      return null;
  }
}
