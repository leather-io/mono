import { useRef } from 'react';

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

function getSkeletonCount(containerWidth: number) {
  const columns = Math.max(2, Math.floor(containerWidth / 180));
  const cardSize = containerWidth / columns;
  const rows = Math.max(2, Math.ceil(window.innerHeight / cardSize));
  return rows * columns;
}

export function CollectiblesLoading() {
  const ref = useRef<HTMLDivElement>(null);
  const width = ref.current?.clientWidth ?? window.innerWidth;
  const count = getSkeletonCount(width);

  return (
    <Box ref={ref} width="100%" flex={1} overflow="hidden">
      <styled.div
        display="grid"
        gridTemplateColumns={['repeat(2, 1fr)', 'repeat(auto-fill, minmax(180px, 1fr))']}
        flex={1}
        minHeight="0"
      >
        {Array.from({ length: count }).map((_, i) => (
          <CollectibleCardSkeleton key={i} index={i} />
        ))}
      </styled.div>
    </Box>
  );
}
