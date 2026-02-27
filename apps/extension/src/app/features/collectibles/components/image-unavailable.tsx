import { Box, styled } from 'leather-styles/jsx';

import { Eye1ClosedIcon } from '@leather.io/ui';

import { CollectibleCard } from './collectible-card';

export function ImageUnavailable() {
  return (
    <CollectibleCard>
      <Box
        width="100%"
        height="100%"
        bg="ink.background-secondary"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px="space.04"
        gap="space.02"
      >
        <Eye1ClosedIcon />
        <styled.span textAlign="center" textStyle="label.02">
          Image currently unavailable
        </styled.span>
      </Box>
    </CollectibleCard>
  );
}
