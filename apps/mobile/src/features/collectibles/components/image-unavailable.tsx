import { PropsWithChildren, ReactNode } from 'react';

import { Box, Eye1ClosedIcon, Text } from '@leather.io/ui/native';

import { CollectibleCard } from './collectible-card';

interface ImageUnavailableProps extends PropsWithChildren {
  height?: number;
  message?: ReactNode;
}

const defaultMessage = 'Image currently unavailable';

export function ImageUnavailable({ height = 200, message, children }: ImageUnavailableProps) {
  const label = message ?? children ?? defaultMessage;

  return (
    <CollectibleCard height={height}>
      <Box
        height={height}
        bg="ink.background-secondary"
        justifyContent="center"
        alignItems="center"
      >
        <Eye1ClosedIcon />
        {label ? (
          <Text textAlign="center" variant="label02">
            {label}
          </Text>
        ) : null}
      </Box>
    </CollectibleCard>
  );
}
