import { Box, Stack, styled } from 'leather-styles/jsx';

import { SkeletonLoader } from '@leather.io/ui';

const CARD_SIZE = 195;

function CollectibleCardSkeleton({ index }: { index: number }) {
  return (
    <Box width={`${CARD_SIZE}px`} height={`${CARD_SIZE}px`}>
      <SkeletonLoader
        isLoading
        width="100%"
        height="100%"
        borderRadius="sm"
        animationDelay={`${index * 100}ms`}
      />
    </Box>
  );
}

export function CollectiblesLoading() {
  return (
    <Stack gap="space.04">
      <Box
        // Full-bleed grid on small widths (HomeTabs adds 24px padding)
        width={['calc(100% + 48px)', '100%']}
        marginX={['-24px', 0]}
      >
        <styled.div
          display="grid"
          gridTemplateColumns={['repeat(2, 195px)', 'repeat(4, 195px)']}
          justifyContent="center"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <CollectibleCardSkeleton key={i} index={i} />
          ))}
        </styled.div>
      </Box>
    </Stack>
  );
}
