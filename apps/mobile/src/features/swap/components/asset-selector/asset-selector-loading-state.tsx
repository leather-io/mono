import { range } from 'remeda';

import { Box, SkeletonLoader } from '@leather.io/ui/native';

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
    <Box flexDirection="row" alignItems="center" gap="3" px="5" py="3">
      <SkeletonLoader borderRadius="round" flex={0} isLoading width={48} height={48} />
      <Box height={36} flex={1} gap="2" justifyContent="center">
        <Box flexDirection="row" gap="2">
          <SkeletonLoader borderRadius="sm" isLoading height={12} width="75%" />
          <SkeletonLoader borderRadius="sm" isLoading height={12} width="25%" flexShrink={1} />
        </Box>
        <SkeletonLoader borderRadius="sm" isLoading flex={0} height={12} width="100%" />
      </Box>
    </Box>
  );
}
