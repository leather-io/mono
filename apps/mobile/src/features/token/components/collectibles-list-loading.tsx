import { useMemo } from 'react';

import { Box, SkeletonLoader } from '@leather.io/ui/native';

interface CollectiblesListLoadingProps {
  count: number;
  height: number;
}
export function CollectiblesListLoading({ count, height }: CollectiblesListLoadingProps) {
  return (
    <Box flexDirection="row" flexWrap="wrap">
      {Array.from({ length: count }).map((_, index) => (
        <Box width="50%" key={`loading-${index}`}>
          <SkeletonLoader
            height={height}
            reverse={index % 2 === 0}
            isLoading={true}
            animationDelay={index * 1000}
            key={`loading-${index}`}
          />
        </Box>
      ))}
    </Box>
  );
}
