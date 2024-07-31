import React, { PropsWithoutRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@leather.io/ui/native';

import { HEADER_HEIGHT } from '../constants';

export function HeaderAvoidingContainer(props: PropsWithoutRef<Parameters<typeof Box>>['0']) {
  const { top } = useSafeAreaInsets();
  const contentOffsetTop = top + HEADER_HEIGHT;
  return (
    <Box
      flex={1}
      backgroundColor="base.ink.background-primary"
      style={{ paddingTop: contentOffsetTop }}
      {...props}
    />
  );
}
