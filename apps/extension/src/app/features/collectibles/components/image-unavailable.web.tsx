import { type PropsWithChildren, type ReactNode } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { Eye1ClosedIcon } from '@leather.io/ui';

import { CollectibleCard } from './collectible-card.web';

interface ImageUnavailableProps extends PropsWithChildren {
  height?: number;
  message?: ReactNode;
}

export function ImageUnavailable({ height = 200 }: ImageUnavailableProps) {
  return (
    <CollectibleCard height={height}>
      <Box
        height={height}
        bg="ink.background-secondary"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px="space.04"
      >
        <Eye1ClosedIcon />
        <styled.span textAlign="center" textStyle="label.02">
          Image currently unavailable
        </styled.span>
      </Box>
    </CollectibleCard>
  );
}
