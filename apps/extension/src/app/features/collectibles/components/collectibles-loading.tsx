import { Box, styled } from 'leather-styles/jsx';

import { SkeletonLoader } from '@leather.io/ui';

function CollectibleCardSkeleton({ index }: { index: number }) {
  return (
    <Box
      width="100%"
      position="relative"
      _before={{
        content: '""',
        display: 'block',
        paddingBottom: '100%',
      }}
    >
      <Box position="absolute" inset={0}>
        <SkeletonLoader
          isLoading
          width="100%"
          height="100%"
          borderRadius="xs"
          animationDelay={`${index * 100}ms`}
        />
      </Box>
    </Box>
  );
}

export function CollectiblesLoading() {
  return (
    <Box width="100%">
      <styled.div
        display="grid"
        gridTemplateColumns={['repeat(2, 1fr)', 'repeat(auto-fill, minmax(180px, 1fr))']}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <CollectibleCardSkeleton key={i} index={i} />
        ))}
      </styled.div>
    </Box>
  );
}
