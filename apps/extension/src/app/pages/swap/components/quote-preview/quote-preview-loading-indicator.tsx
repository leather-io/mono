import { Box } from 'leather-styles/jsx';

import { SkeletonLoader } from '@leather.io/ui';

export function QuotePreviewLoadingIndicator() {
  return (
    <Box display="flex" flexDirection="column" px="space.04" mt="space.05" gap="space.02" h="64px">
      <SkeletonLoader width="100%" height={24} borderRadius="xs" isLoading />
      <Box h="0.5px" mx="space.01" bg="ink.border-transparent" />
      <SkeletonLoader width="100%" height={24} borderRadius="xs" isLoading />
    </Box>
  );
}
