import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

export function useScrollViewStyles() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return {
    gap: theme.spacing[3],
    paddingBottom: theme.spacing[5] + bottom,
    paddingHorizontal: theme.spacing[5],
  };
}
