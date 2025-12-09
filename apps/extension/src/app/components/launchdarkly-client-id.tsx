import { useMemo } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { getClientId } from '@app/common/client-id';

export function LaunchDarklyClientId() {
  const clientId = useMemo(() => getClientId(), []);

  if (!clientId) return null;

  return (
    <Box bg="ink.background-secondary" px="space.04" py="space.01" mt="space.02">
      <styled.span
        textStyle="code"
        fontSize="10px"
        color="ink.text-subdued"
        overflowWrap="break-word"
      >
        LaunchDarkly clientId: {clientId}
      </styled.span>
    </Box>
  );
}
