import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@shopify/restyle';
import { BlurView } from 'expo-blur';

import { Box, Theme } from '@leather.io/ui/native';

export const ACTION_BAR_HEIGHT = 70;
export const ACTION_BAR_BOTTOM_OFFSET = 40;
export const ACTION_BAR_TOTAL_HEIGHT = ACTION_BAR_HEIGHT + ACTION_BAR_BOTTOM_OFFSET;

export function ActionBar(props: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Box width="100%" px="5" justifyContent="center" alignItems="center">
      <BlurView
        tint="systemChromeMaterial"
        intensity={90}
        style={{
          flexDirection: 'row',
          width: '100%',
          paddingHorizontal: theme.spacing[5],
          paddingVertical: theme.spacing[2],
          height: ACTION_BAR_HEIGHT,
          position: 'absolute',
          shadowColor: theme.colors['base.ink.background-overlay'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          bottom: ACTION_BAR_BOTTOM_OFFSET + bottom,
          borderRadius: theme.borderRadii.xs,
        }}
      >
        <Box flex={1} flexDirection="row" justifyContent="center" alignItems="center">
          {props?.left}
        </Box>
        <Box flex={1} flexDirection="row" justifyContent="center" alignItems="center">
          {props?.center}
        </Box>
        <Box flex={1} flexDirection="row" justifyContent="center" alignItems="center">
          {props?.right}
        </Box>
      </BlurView>
    </Box>
  );
}
