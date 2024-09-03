import React, { ReactNode } from 'react';
import { EdgeInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings.write';

import { BlurView, Box } from '@leather.io/ui/native';

import { HEADER_HEIGHT } from '../constants';

interface BlurredHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  bottom?: ReactNode;
  insets: EdgeInsets;
}

export function BlurredHeader({ left, center, right, bottom, insets }: BlurredHeaderProps) {
  const { theme: themeVariant } = useSettings();
  return (
    <BlurView
      themeVariant={themeVariant}
      intensity={90}
      style={{
        width: '100%',
        position: 'absolute',
        paddingTop: insets.top,
        justifyContent: 'center',
      }}
    >
      <Box
        py="3"
        px="3"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        height={HEADER_HEIGHT}
        gap="2"
      >
        <Box height="100%" flex={1} alignItems="flex-start" justifyContent="center">
          {left}
        </Box>
        <Box height="100%" flex={2} alignItems="center" justifyContent="center">
          {center}
        </Box>
        <Box height="100%" flex={1} alignItems="flex-end" justifyContent="center">
          {right}
        </Box>
      </Box>
      {bottom}
    </BlurView>
  );
}
