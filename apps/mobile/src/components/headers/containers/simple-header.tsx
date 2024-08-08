import React, { ReactNode } from 'react';
import { EdgeInsets } from 'react-native-safe-area-context';

import { Box } from '@leather.io/ui/native';

import { HEADER_HEIGHT } from '../constants';

interface SimpleHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  insets: EdgeInsets;
}
export function SimpleHeader(props: SimpleHeaderProps) {
  return (
    <Box
      bg="ink.background-primary"
      style={{
        width: '100%',
        paddingTop: props.insets.top,
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
          {props?.left}
        </Box>
        <Box height="100%" flex={2} alignItems="center" justifyContent="center">
          {props?.center}
        </Box>
        <Box height="100%" flex={1} alignItems="flex-end" justifyContent="center">
          {props?.right}
        </Box>
      </Box>
    </Box>
  );
}
