import { Box, Flex } from 'leather-styles/jsx';
import { range } from 'remeda';

import { SkeletonLoader } from '@leather.io/ui';

export function AssetSelectorLoadingState() {
  return (
    <Box>
      {range(0, 10).map(i => (
        <AssetItemPlaceholder key={i} />
      ))}
    </Box>
  );
}

function AssetItemPlaceholder() {
  return (
    <Flex alignItems="center" gap="space.03" px="space.05" py="space.03">
      <SkeletonLoader isLoading width={48} height={48} borderRadius="round" flexShrink={0} />
      <Flex direction="column" flex={1} gap="space.02" justifyContent="center">
        <Flex gap="space.02">
          <SkeletonLoader isLoading width="75%" height={12} borderRadius="xs" />
          <SkeletonLoader isLoading width="25%" height={12} borderRadius="xs" flexShrink={1} />
        </Flex>
        <SkeletonLoader isLoading width="100%" height={12} borderRadius="xs" />
      </Flex>
    </Flex>
  );
}
