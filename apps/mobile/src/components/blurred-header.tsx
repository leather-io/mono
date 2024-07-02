import React, { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BlurView } from 'expo-blur';
import { Stack, Tabs } from 'expo-router';

import { Box } from '@leather.io/ui/native';

// TODO: would love for us to find a better way of fixing this.
// These types are imported in expo-router from @react-native/native-stack,
// but are not re-exported afterwards. I don't think installing @react-native/native-stack
// as a dev dependency just for types is a good idea, because we would need to maintain matching versions
// of expo-router's and our's @react-native/native-stack dependency
type BottomTabHeaderProps = Parameters<
  NonNullable<NonNullable<Parameters<typeof Tabs.Screen>[0]['options']>['header']>
>[0];

type NativeStackHeaderProps = Parameters<
  NonNullable<NonNullable<Parameters<typeof Stack.Screen>[0]['options']>['header']>
>[0];

export const HEADER_HEIGHT = 64;

export function createBlurredHeader(components?: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  bottom?: ReactNode;
}) {
  return function BlurredHeader(
    _: BottomTabHeaderProps | NativeStackHeaderProps
  ): React.JSX.Element {
    const { top } = useSafeAreaInsets();
    return (
      <BlurView
        tint="systemChromeMaterial"
        intensity={90}
        style={{
          width: '100%',
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
          height={HEADER_HEIGHT}
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
        {components?.bottom}
      </BlurView>
    );
  };
}
