import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';

import { Box } from '@leather.io/ui/native';

type BottomTabsNavigationOptionsHeader = NonNullable<
  Parameters<typeof Tabs.Screen>[0]['options']
>['header'];

export const HEADER_HEIGHT = 64;

export function createBlurredHeader(components?: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}): BottomTabsNavigationOptionsHeader {
  return function () {
    const { top } = useSafeAreaInsets();
    return (
      <BlurView
        tint="systemChromeMaterial"
        intensity={90}
        style={{
          width: '100%',
          height: top + HEADER_HEIGHT,
          position: 'absolute',
          paddingTop: top,
          justifyContent: 'center',
        }}
      >
        <Box
          py="3"
          px="5"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          height="100%"
          gap="2"
        >
          <Box height="100%" flex={1} alignItems="flex-start" justifyContent="center">
            {components?.left}
          </Box>
          <Box height="100%" flex={2} alignItems="center" justifyContent="center">
            {components?.center}
          </Box>
          <Box height="100%" flex={1} alignItems="flex-end" justifyContent="center">
            {components?.right}
          </Box>
        </Box>
      </BlurView>
    );
  };
}
